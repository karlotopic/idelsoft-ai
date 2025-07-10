import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

// this should implement a LLM client interface
export class OpenAIClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCompletion(systemPrompt, messages, temperature = 0.1) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: messages,
        },
      ],
      temperature,
    });
    return response.choices[0].message.content;
  }

  async generateStreamingCompletion(
    systemPrompt,
    messages,
    temperature = 0.1,
    responseFormat
  ) {
    const stream = this.client.chat.completions.stream({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: messages,
        },
      ],
      temperature: temperature,
      response_format: zodResponseFormat(responseFormat, "email"),
    });

    return stream;
  }
}
