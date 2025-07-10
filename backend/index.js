// ESM
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EmailController } from './src/email/email.controller.js';


/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

const emailController = new EmailController();

fastify.register(emailController.registerRoutes.bind(emailController), { prefix: '/api' });

fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowedHeaders: '*',
});

fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server is now listening on ${address}`)
})
