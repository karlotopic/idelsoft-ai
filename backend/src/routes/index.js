import { EmailRepository } from '../email/email.repository.js';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";


// Try to import OpenAI, but don't fail if it's not available
let openai = null;
try {
  const OpenAI = await import("openai");
  openai = new OpenAI.default({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI package not available, AI generation will be disabled');
}

export default async function routes(fastify, options) {
  fastify.get('/api/emails', async (request, reply) => {
    try {
      const emails = await EmailRepository.getEmails();
      return { emails };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch emails' });
    }
  });


  fastify.get('/api/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const email = await EmailRepository.getEmailById(id);
      if (!email) {
        return reply.code(404).send({ error: 'Email not found' });
      }
      return { email };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch email' });
    }
  });

  const opts = {
    schema: {
      body: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          cc: { type: 'string' },
          bcc: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' }
        },
        required: ['to', 'subject', 'body']
      }
    }
  }

  fastify.post('/api/emails', opts, async (request, reply) => {
    try {
      const { to, cc, bcc, subject, body } = request.body;

      const [email] = await EmailRepository.createEmail({
        to,
        cc,
        bcc,
        subject,
        body
      });
      return { email };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create email' });
    }
  });

  fastify.post('/api/generate-email', async (request, reply) => {
    try {
      const { prompt } = request.body;
      
      // Check if OpenAI is available
      if (!openai) {
        return reply.code(503).send({ 
          error: 'AI generation is not available. Please install the OpenAI package and set up an API key.',
          subject: 'AI Generation Unavailable',
          body: 'Please install the OpenAI package and configure an API key to use AI generation features.'
        });
      }

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        "Access-Control-Allow-Origin": "*",
      });
      
      const routerResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a router assistant. Analyze the user's email request and classify it into one of two categories:
            1. "sales" - for sales-related emails, business proposals, outreach
            2. "followup" - for follow-up emails, checking in, polite reminders
            
            Respond with only the category: "sales" or "followup"`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1
      });

      const category = routerResponse.choices[0].message.content.trim().toLowerCase();
      
      let systemPrompt = "";
      if (category === "sales") {
        systemPrompt = `You are a Sales Assistant. Generate concise sales emails that are:
        - Under 40 words total
        - Maximum 7-10 words per sentence
        - Professional and engaging
        - Tailored to business context
        
        Generate both a subject line and email body.`;
      } else {
        systemPrompt = `You are a Follow-up Assistant. Generate polite follow-up emails that are:
        - Professional and courteous
        - Under 40 words total
        - Maximum 7-10 words per sentence
        - Gentle and non-pushy
        
        Generate both a subject line and email body.`;
      }


      const EmailResponse = z.object({
        body: z.string(),
        subject: z.string(),
      });

      const stream = await openai.chat.completions.stream({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: zodResponseFormat(EmailResponse, "email"),
      })
      .on("refusal.done", () => console.log("request refused"))
      .on("content.delta", ({ parsed, snapshot }) => {
        reply.raw.write(`data: ${JSON.stringify({ email: parsed })}\n\n`);
      })

      await stream.done();
      reply.raw.end();
      
    } catch (error) {
      console.error('AI generation error:', error);
      if (!reply.sent) {
        reply.code(500).send({ error: 'Failed to generate email' });
      } else {
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to generate email' })}\n\n`);
        reply.raw.end();
      }
    }
  });
}
