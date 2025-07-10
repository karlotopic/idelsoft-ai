import { knexInstance } from '../../db/index.js';

export class EmailRepository {
  // also, the db connection should be injected
  async getEmails() {
    return knexInstance.select('*').from('emails').orderBy('created_at', 'desc');
  }

  async getEmailById(id) {
    return knexInstance.select('*').from('emails').where('id', id).first();
  }

  async createEmail(data) {
    return knexInstance('emails').insert(data).returning('*');
  }
} 