import { EmailRepository } from './email.repository.js';
import { EmailValidator } from './email.validator.js';

export class EmailService {
  constructor() {
    this.repository = new EmailRepository();
    this.validator = new EmailValidator();
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
      // Validate email data
      const validationResult = this.validator.validateCreate(emailData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      const [email] = await this.repository.createEmail(emailData);
      return email;
    } catch (error) {
      throw new Error(`Failed to create email: ${error.message}`);
    }
  }

  async updateEmail(id, emailData) {
    try {
      const validationResult = this.validator.validateUpdate(emailData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      const email = await this.repository.updateEmail(id, emailData);
      if (!email) {
        throw new Error('Email not found');
      }
      return email;
    } catch (error) {
      throw new Error(`Failed to update email: ${error.message}`);
    }
  }

  async deleteEmail(id) {
    try {
      const deleted = await this.repository.deleteEmail(id);
      if (!deleted) {
        throw new Error('Email not found');
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete email: ${error.message}`);
    }
  }
} 