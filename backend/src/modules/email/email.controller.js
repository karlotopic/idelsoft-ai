import { EmailService } from './email.service.js';

export class EmailController {
  constructor() {
    this.emailService = new EmailService();
  }

  async getAllEmails(request, reply) {
    try {
      const emails = await this.emailService.getAllEmails();
      return { emails };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }

  async getEmailById(request, reply) {
    try {
      const { id } = request.params;
      const email = await this.emailService.getEmailById(id);
      return { email };
    } catch (error) {
      if (error.message === 'Email not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  }

  async createEmail(request, reply) {
    try {
      const emailData = request.body;
      const email = await this.emailService.createEmail(emailData);
      reply.code(201).send({ email });
    } catch (error) {
      if (error.message.includes('Validation failed')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  }

  async updateEmail(request, reply) {
    try {
      const { id } = request.params;
      const emailData = request.body;
      const email = await this.emailService.updateEmail(id, emailData);
      return { email };
    } catch (error) {
      if (error.message === 'Email not found') {
        reply.code(404).send({ error: error.message });
      } else if (error.message.includes('Validation failed')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  }

  async deleteEmail(request, reply) {
    try {
      const { id } = request.params;
      await this.emailService.deleteEmail(id);
      reply.code(204).send();
    } catch (error) {
      if (error.message === 'Email not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  }
} 