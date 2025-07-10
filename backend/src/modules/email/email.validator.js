export class EmailValidator {
  validateCreate(data) {
    const errors = [];
    
    if (!data.to || typeof data.to !== 'string') {
      errors.push('Recipient email (to) is required and must be a string');
    } else if (!this.isValidEmail(data.to)) {
      errors.push('Invalid recipient email format');
    }
    
    if (!data.subject || typeof data.subject !== 'string') {
      errors.push('Subject is required and must be a string');
    } else if (data.subject.trim().length === 0) {
      errors.push('Subject cannot be empty');
    }
    
    if (!data.body || typeof data.body !== 'string') {
      errors.push('Body is required and must be a string');
    } else if (data.body.trim().length === 0) {
      errors.push('Body cannot be empty');
    }
    
    // Optional fields validation
    if (data.cc && !this.isValidEmail(data.cc)) {
      errors.push('Invalid CC email format');
    }
    
    if (data.bcc && !this.isValidEmail(data.bcc)) {
      errors.push('Invalid BCC email format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateUpdate(data) {
    const errors = [];
    
    if (data.to && !this.isValidEmail(data.to)) {
      errors.push('Invalid recipient email format');
    }
    
    if (data.cc && !this.isValidEmail(data.cc)) {
      errors.push('Invalid CC email format');
    }
    
    if (data.bcc && !this.isValidEmail(data.bcc)) {
      errors.push('Invalid BCC email format');
    }
    
    if (data.subject && data.subject.trim().length === 0) {
      errors.push('Subject cannot be empty');
    }
    
    if (data.body && data.body.trim().length === 0) {
      errors.push('Body cannot be empty');
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
} 