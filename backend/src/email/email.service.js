import { EmailRepository } from './email.repository.js';
import { LLMService } from '../llm/llm.service.js';

export class EmailService {
  constructor() {
    this.repository = new EmailRepository();
    this.llmService = new LLMService();
  }

  async getAllEmails() {
    try {
      return await this.repository.getEmails();
    } catch (error) {
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }

  async getEmailById(id) {
    try {
      const email = await this.repository.getEmailById(id);
      if (!email) {
        throw new Error('Email not found');
      }
      return email;
    } catch (error) {
      throw new Error(`Failed to fetch email: ${error.message}`);
    }
  }

  async createEmail(emailData) {
    try {
      const [email] = await this.repository.createEmail(emailData);
      return email;
    } catch (error) {
      throw new Error(`Failed to create email: ${error.message}`);
    }
  }

  async generateEmail(prompt) {
    try {
      const emailType = await this.llmService.classifyEmailType(prompt);
      const stream = await this.llmService.generateEmail(prompt, emailType);
      return stream;
    } catch (error) {
      throw new Error(`Failed to generate email: ${error.message}`);
    }
  }
}