import { OpenAIClient } from "./clients/openai.js";
import { z } from "zod";

export class LLMService {
  constructor() {
    // this can later be changed to inject the client based on the environment variable
    if (process.env.OPENAI_API_KEY) {
      this.llmClient = new OpenAIClient();
    }
  }

  async classifyEmailType(emailMessage) {
    try {
      const systemPrompt = `You are a router assistant. Analyze the user's email request and classify it into one of two categories:
        1. "sales" - for sales-related emails, business proposals, outreach
        2. "followup" - for follow-up emails, checking in, polite reminders
        
        Respond with only the category: "sales" or "followup"`;

      const response = await this.llmClient.generateCompletion(
        systemPrompt,
        emailMessage,
        0.1
      );
      return response.trim().toLowerCase() === "sales" ? "sales" : "followup";
    } catch (error) {
      throw new Error(`Failed to classify email type: ${error.message}`);
    }
  }

  async generateEmail(emailMessage, emailType) {
    let systemPrompt = "";

    if (emailType === "sales") {
      systemPrompt = `You are a Sales Assistant. Generate concise sales emails that are:
      - Under 40 words total
      - Maximum 7-10 words per sentence
      - Professional and engaging
      - Tailored to the business context of the user's request`
    } else {
      systemPrompt = `You are a Follow-up Assistant. Generate polite follow-up emails that are:
      - Professional and concise
      - Under 40 words total
      - Maximum 7-10 words per sentence
      - Gentle and non-pushy`
    }

    systemPrompt += `
      The email should be in the following format:
      Hello [name],
      [body]
      Best regards,
      [your name]

      Generate both a subject line and email body.
    `;

    const emailResponse = z.object({
      body: z.string(),
      subject: z.string(),
    });

    const stream = await this.llmClient.generateStreamingCompletion(
      systemPrompt,
      emailMessage,
      0.1,
      emailResponse
    );

    return stream;
  }
}
