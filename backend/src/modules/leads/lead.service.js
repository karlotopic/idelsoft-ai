import { LeadRepository } from './lead.repository.js';
import { LeadValidator } from './lead.validator.js';

export class LeadService {
  constructor() {
    this.repository = new LeadRepository();
    this.validator = new LeadValidator();
  }

  async getAllLeads() {
    try {
      return await this.repository.getLeads();
    } catch (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }
  }

  async getLeadById(id) {
    try {
      const lead = await this.repository.getLeadById(id);
      if (!lead) {
        throw new Error('Lead not found');
      }
      return lead;
    } catch (error) {
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }
  }

  async createLead(leadData) {
    try {
      const validationResult = this.validator.validateCreate(leadData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      const [lead] = await this.repository.createLead(leadData);
      return lead;
    } catch (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }
  }

  async updateLead(id, leadData) {
    try {
      const validationResult = this.validator.validateUpdate(leadData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      const lead = await this.repository.updateLead(id, leadData);
      if (!lead) {
        throw new Error('Lead not found');
      }
      return lead;
    } catch (error) {
      throw new Error(`Failed to update lead: ${error.message}`);
    }
  }

  async deleteLead(id) {
    try {
      const deleted = await this.repository.deleteLead(id);
      if (!deleted) {
        throw new Error('Lead not found');
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete lead: ${error.message}`);
    }
  }

  async getLeadsByStatus(status) {
    try {
      return await this.repository.getLeadsByStatus(status);
    } catch (error) {
      throw new Error(`Failed to fetch leads by status: ${error.message}`);
    }
  }
} 