import { OpenAIService } from './openai.service.js';
import { EmailGenerator } from './email.generator.js';

export class LLMService {
  constructor() {
    this.openaiService = new OpenAIService();
    this.emailGenerator = new EmailGenerator();
  }

  async generateEmail(prompt) {
    try {
      // First, classify the email type
      const category = await this.classifyEmailType(prompt);
      
      // Generate email based on category
      const email = await this.emailGenerator.generateEmail(prompt, category);
      
      return {
        category,
        email
      };
    } catch (error) {
      throw new Error(`Failed to generate email: ${error.message}`);
    }
  }

  async classifyEmailType(prompt) {
    try {
      const response = await this.openaiService.generateCompletion([
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
      ], { temperature: 0.1 });

      const category = response.choices[0].message.content.trim().toLowerCase();
      return category === 'sales' ? 'sales' : 'followup';
    } catch (error) {
      throw new Error(`Failed to classify email type: ${error.message}`);
    }
  }

  async generateStreamingEmail(prompt, reply) {
    try {
      const category = await this.classifyEmailType(prompt);
      return await this.emailGenerator.generateStreamingEmail(prompt, category, reply);
    } catch (error) {
      throw new Error(`Failed to generate streaming email: ${error.message}`);
    }
  }
} 