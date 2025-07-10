import { createEmailSchema } from "./dto/create-email.dto.js";
import { EmailService } from "./email.service.js";

export class EmailController {
  constructor() {
    // this should be injected but since we're not using typescript, we'll just use a new instance
    this.emailService = new EmailService();
  }

  registerRoutes(fastify, options, done) {
    fastify.get("/emails", this.getAllEmails.bind(this));
    fastify.get("/emails/:id", this.getEmailById.bind(this));
    fastify.post("/emails", createEmailSchema, this.createEmail.bind(this));
    fastify.post("/emails/generate", this.generateEmail.bind(this));
    done();
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
      if (error.message === "Email not found") {
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
      if (error.message.includes("Validation failed")) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  }

  async generateEmail(request, reply) {
    try {
      const { prompt } = request.body;
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      const stream = await this.emailService.generateEmail(prompt);
      stream
        // this should be mapped to a different event type name (standardized over different llm clients)
        .on("refusal.done", () => {
          console.log("request refused");
          reply.raw.write(
            `data: ${JSON.stringify({
              type: "error",
              error: "Request refused",
            })}\n\n`
          );
        })
        .on("content.delta", ({ parsed, snapshot }) => {
          if (parsed) {
            reply.raw.write(`data: ${JSON.stringify({ email: parsed })}\n\n`);
          }
        })
        .on("error", (error) => {
          console.error("Streaming error:", error);
          reply.raw.write(
            `data: ${JSON.stringify({
              type: "error",
              error: "Streaming error",
            })}\n\n`
          );
        });

      await stream.done();
      reply.raw.end();
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }
}
