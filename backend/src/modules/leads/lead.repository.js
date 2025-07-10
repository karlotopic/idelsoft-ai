import { knexInstance } from '../../db/index.js';

export class LeadRepository {
  async getLeads() {
    return knexInstance.select('*').from('leads').orderBy('created_at', 'desc');
  }

  async getLeadById(id) {
    return knexInstance.select('*').from('leads').where('id', id).first();
  }

  async createLead(data) {
    return knexInstance('leads').insert(data).returning('*');
  }

  async updateLead(id, data) {
    return knexInstance('leads')
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*')
      .first();
  }

  async deleteLead(id) {
    return knexInstance('leads').where('id', id).del();
  }

  async getLeadsByStatus(status) {
    return knexInstance.select('*').from('leads').where('status', status).orderBy('created_at', 'desc');
  }

  async getLeadsByEmail(email) {
    return knexInstance.select('*').from('leads').where('email', email);
  }
} 