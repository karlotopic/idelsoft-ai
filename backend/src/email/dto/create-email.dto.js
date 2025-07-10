export const createEmailSchema = {
    schema: {
      body: {
        type: 'object',
        properties: {
          to: { 
            type: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: 'Primary recipient email address'
          },
          cc: { 
            type: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: 'Carbon copy recipient email address (optional)'
          },
          bcc: { 
            type: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: 'Blind carbon copy recipient email address (optional)'
          },
          subject: { 
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Email subject line'
          },
          body: { 
            type: 'string',
            minLength: 1,
            description: 'Email body content'
          }
        },
        required: ['to', 'subject', 'body'],
        additionalProperties: false
      }
    }
  }