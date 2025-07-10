import { knexInstance } from '../../../db/index.js';

export class EmailRepository {
  async getEmails() {
    return knexInstance.select('*').from('emails').orderBy('created_at', 'desc');
  }

  async getEmailById(id) {
    return knexInstance.select('*').from('emails').where('id', id).first();
  }

  async createEmail(data) {
    return knexInstance('emails').insert(data).returning('*');
  }

  async updateEmail(id, data) {
    return knexInstance('emails')
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*')
      .first();
  }

  async deleteEmail(id) {
    return knexInstance('emails').where('id', id).del();
  }

  async getEmailsByStatus(status) {
    return knexInstance.select('*').from('emails').where('status', status).orderBy('created_at', 'desc');
  }
} 