import { knexInstance } from '../../db/index.js';

export class EmailRepository {
  static async getEmails() {
    return knexInstance.select('*').from('emails').orderBy('created_at', 'desc');
  }

  static async getEmailById(id) {
    return knexInstance.select('*').from('emails').where('id', id).first();
  }

  static async createEmail(data) {
    return knexInstance('emails').insert(data).returning('*');
  }
}