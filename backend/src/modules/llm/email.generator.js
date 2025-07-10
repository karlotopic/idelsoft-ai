import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

export class EmailGenerator {
  constructor() {
    this.openaiService = null;
    this.initializeOpenAI();
  }

  async initializeOpenAI() {
    try {
      const { OpenAIService } = await import('./openai.service.js');
      this.openaiService = new OpenAIService();
    } catch (error) {
      console.warn('OpenAI service not available');
    }
  }

  getSystemPrompt(category) {
    if (category === "sales") {
      return `You are a Sales Assistant. Generate concise sales emails that are:
      - Under 40 words total
      - Maximum 7-10 words per sentence
      - Professional and engaging
      - Tailored to business context
      
      Generate both a subject line and email body.`;
    } else {
      return `You are a Follow-up Assistant. Generate polite follow-up emails that are:
      - Professional and courteous
      - Under 40 words total
      - Maximum 7-10 words per sentence
      - Gentle and non-pushy
      
      Generate both a subject line and email body.`;
    }
  }

  async generateEmail(prompt, category) {
    if (!this.openaiService || !this.openaiService.isAvailable()) {
      throw new Error('OpenAI service is not available');
    }

    const systemPrompt = this.getSystemPrompt(category);
    const EmailResponse = z.object({
      body: z.string(),
      subject: z.string(),
    });

    const response = await this.openaiService.generateCompletion([
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      response_format: zodResponseFormat(EmailResponse, "email"),
    });

    return response.choices[0].message.content;
  }

  async generateStreamingEmail(prompt, category, reply) {
    if (!this.openaiService || !this.openaiService.isAvailable()) {
      throw new Error('OpenAI service is not available');
    }

    const systemPrompt = this.getSystemPrompt(category);
    const EmailResponse = z.object({
      body: z.string(),
      subject: z.string(),
    });

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      "Access-Control-Allow-Origin": "*",
    });

    const stream = await this.openaiService.generateStreamingCompletion([
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      response_format: zodResponseFormat(EmailResponse, "email"),
    });

    stream
      .on("refusal.done", () => console.log("request refused"))
      .on("content.delta", ({ parsed, snapshot }) => {
        reply.raw.write(`data: ${JSON.stringify({ email: parsed })}\n\n`);
      });

    await stream.done();
    reply.raw.end();
  }
} 