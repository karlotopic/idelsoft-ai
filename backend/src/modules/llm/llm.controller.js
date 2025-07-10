import { LLMService } from './llm.service.js';

export class LLMController {
  constructor() {
    this.llmService = new LLMService();
  }

  async generateEmail(request, reply) {
    try {
      const { prompt } = request.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return reply.code(400).send({ error: 'Prompt is required and must be a string' });
      }

      const result = await this.llmService.generateEmail(prompt);
      return { ...result };
    } catch (error) {
      if (error.message.includes('OpenAI service is not available')) {
        return reply.code(503).send({ 
          error: 'AI generation is not available. Please install the OpenAI package and set up an API key.',
          subject: 'AI Generation Unavailable',
          body: 'Please install the OpenAI package and configure an API key to use AI generation features.'
        });
      }
      reply.code(500).send({ error: error.message });
    }
  }

  async generateStreamingEmail(request, reply) {
    try {
      const { prompt } = request.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return reply.code(400).send({ error: 'Prompt is required and must be a string' });
      }

      await this.llmService.generateStreamingEmail(prompt, reply);
    } catch (error) {
      console.error('AI generation error:', error);
      if (!reply.sent) {
        if (error.message.includes('OpenAI service is not available')) {
          return reply.code(503).send({ 
            error: 'AI generation is not available. Please install the OpenAI package and set up an API key.',
            subject: 'AI Generation Unavailable',
            body: 'Please install the OpenAI package and configure an API key to use AI generation features.'
          });
        }
        reply.code(500).send({ error: error.message });
      } else {
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        reply.raw.end();
      }
    }
  }
} 