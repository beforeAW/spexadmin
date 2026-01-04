import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import routes from './routes/index.js';

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(cors, {
  origin: true,
});

// Register JWT
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
});

// Register routes
await fastify.register(routes);

// Root endpoint
fastify.get('/', async () => ({
  name: 'Spexadmin API',
  version: '1.0.0',
  status: 'running',
  endpoints: {
    health: '/health',
    api: '/api',
  },
}));

// Favicon handler to prevent 404s from default browser requests
fastify.get('/favicon.ico', async (request, reply) => {
  // Respond with No Content; frontend provides an inline favicon
  reply.status(204).send();
});

// Health check endpoint
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await fastify.close();
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    await disconnectDatabase();
    process.exit(1);
  }
};

start();
