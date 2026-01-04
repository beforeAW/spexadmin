import { FastifyInstance } from 'fastify';
import { User } from '../models/User.js';

async function routes(fastify: FastifyInstance): Promise<void> {
  // Example API routes
  fastify.get('/api/hello', async () => ({
    message: 'Hello from Spexadmin API',
  }));

  // Get all users
  fastify.get('/api/users', async () => {
    const users = await User.find();
    return { users };
  });

  // Create a new user
  fastify.post<{
    Body: { name: string; email: string };
  }>('/api/users', async (request, reply) => {
    try {
      const { name, email } = request.body;
      const user = new User({ name, email });
      await user.save();
      reply.status(201).send(user);
    } catch (error) {
      reply.status(400).send({ error: 'Failed to create user' });
    }
  });

  // Get user by ID
  fastify.get<{
    Params: { id: string };
  }>('/api/users/:id', async (request, reply) => {
    try {
      const user = await User.findById(request.params.id);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    } catch (error) {
      reply.status(400).send({ error: 'Invalid user ID' });
    }
  });

  // Update user
  fastify.put<{
    Params: { id: string };
    Body: { name?: string; email?: string };
  }>('/api/users/:id', async (request, reply) => {
    try {
      const user = await User.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    } catch (error) {
      reply.status(400).send({ error: 'Failed to update user' });
    }
  });

  // Delete user
  fastify.delete<{
    Params: { id: string };
  }>('/api/users/:id', async (request, reply) => {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.status(204).send();
    } catch (error) {
      reply.status(400).send({ error: 'Failed to delete user' });
    }
  });
}

export default routes;
