export class LeadValidator {
  validateCreate(data) {
    const errors = [];
    
    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    }
    
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.company && typeof data.company !== 'string') {
      errors.push('Company must be a string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateUpdate(data) {
    const errors = [];
    
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (data.name && data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    }
    
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.company && typeof data.company !== 'string') {
      errors.push('Company must be a string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9\-\s]{7,15}$/;
    return phoneRegex.test(phone);
  }
} 