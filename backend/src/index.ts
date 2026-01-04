import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
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

// Register routes
await fastify.register(routes);

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
