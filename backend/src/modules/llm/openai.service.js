import OpenAI from 'openai';

export class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCompletion(messages, options = {}) {
    const defaultOptions = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      ...options
    };

    return this.openai.chat.completions.create({
      ...defaultOptions,
      messages
    });
  }

  async generateStreamingCompletion(messages, options = {}) {
    const defaultOptions = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      ...options
    };

    return this.openai.chat.completions.stream({
      ...defaultOptions,
      messages
    });
  }

  isAvailable() {
    return !!process.env.OPENAI_API_KEY;
  }
} 