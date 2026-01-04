import { FastifyInstance } from 'fastify';

async function routes(fastify: FastifyInstance): Promise<void> {
  // Example API routes
  fastify.get('/api/hello', async () => ({
    message: 'Hello from Spexadmin API',
  }));

  fastify.get('/api/users', async () => ({
    users: [],
  }));
}

export default routes;
