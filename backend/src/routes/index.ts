import { FastifyInstance } from 'fastify';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Group } from '../models/Group.js';
import {
  authenticate,
  requireAdmin,
  requireManager,
  requireEventManager,
  requireAdminOrManager,
  requireGroupManager,
} from '../middleware/auth.js';

async function routes(fastify: FastifyInstance): Promise<void> {
  // Example API routes
  fastify.get('/api/hello', async () => ({
    message: 'Hello from Spexadmin API',
  }));

  // ==================== AUTHENTICATION ROUTES ====================

  // Register a new user
  fastify.post<{
    Body: {
      email: string;
      password: string;
      personnummer?: string;
      firstname: string;
      nickname?: string;
      lastname: string;
      foodpreference?: string;
      allergys?: string[];
      groups?: string[];
    };
  }>('/api/auth/register', async (request, reply) => {
    try {
      const user = new User(request.body);
      await user.save();

      const token = fastify.jwt.sign({
        id: user._id,
        email: user.email,
        roles: user.roles,
      });

      // Remove password from response
      const userResponse: any = user.toObject();
      delete userResponse.password;

      reply.status(201).send({ user: userResponse, token });
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'User with this email already exists' });
      } else {
        reply.status(400).send({ error: 'Failed to create user', details: error.message });
      }
    }
  });

  // Login
  fastify.post<{
    Body: {
      email: string;
      password: string;
    };
  }>('/api/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        reply.status(401).send({ error: 'Invalid email or password' });
        return;
      }

      // Check if user is active
      if (!user.active) {
        reply.status(403).send({ error: 'Account is inactive' });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        reply.status(401).send({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user._id,
        email: user.email,
        roles: user.roles,
      });

      // Remove password from response
      const userResponse: any = user.toObject();
      delete userResponse.password;

      reply.send({ user: userResponse, token });
    } catch (error: any) {
      reply.status(400).send({ error: 'Login failed', details: error.message });
    }
  });

  // Get current user profile (requires JWT)
  fastify.get('/api/auth/me', async (request, reply) => {
    try {
      await request.jwtVerify();
      const decoded = request.user as { id: string };

      const user = await User.findById(decoded.id);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }

      reply.send(user);
    } catch (error) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // ==================== USER ROUTES ====================

  // Get all users
  fastify.get('/api/users', async () => {
    const users = await User.find();
    return { users };
  });

  // Create a new user
  fastify.post<{
    Body: {
      email: string;
      personnummer?: string;
      firstname: string;
      nickname?: string;
      lastname: string;
      foodpreference?: string;
      allergys?: string[];
      roles?: string[];
      groups?: string[];
      active?: boolean;
    };
  }>('/api/users', async (request, reply) => {
    try {
      const user = new User(request.body);
      await user.save();
      reply.status(201).send(user);
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'User with this email already exists' });
      } else {
        reply.status(400).send({ error: 'Failed to create user', details: error.message });
      }
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
    Body: {
      email?: string;
      personnummer?: string;
      firstname?: string;
      nickname?: string;
      lastname?: string;
      foodpreference?: string;
      allergys?: string[];
      roles?: string[];
      groups?: string[];
      active?: boolean;
    };
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
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'Email already in use' });
      } else {
        reply.status(400).send({ error: 'Failed to update user', details: error.message });
      }
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

  // ==================== ADMIN USER MANAGEMENT ROUTES ====================

  // Admin: Get all users (without sensitive fields)
  fastify.get('/api/admin/users', { preHandler: [requireAdmin] }, async (_request, reply) => {
    try {
      const users = await User.find().select('-foodpreference -allergys -personnummer');
      reply.send({ users });
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to fetch users', details: error.message });
    }
  });

  // Admin: Get user by ID (without sensitive fields)
  fastify.get<{
    Params: { userId: string };
  }>('/api/admin/users/:userId', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const user = await User.findById(request.params.userId).select(
        '-foodpreference -allergys -personnummer'
      );
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid user ID', details: error.message });
    }
  });

  // Admin: Create a new user
  fastify.post<{
    Body: {
      email: string;
      password: string;
      personnummer?: string;
      firstname: string;
      nickname?: string;
      lastname: string;
      roles?: string[];
      groups?: string[];
      active?: boolean;
    };
  }>('/api/admin/users', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const user = new User(request.body);
      await user.save();

      // Return without sensitive fields
      const userResponse: any = user.toObject();
      delete userResponse.password;
      delete userResponse.foodpreference;
      delete userResponse.allergys;
      delete userResponse.personnummer;

      reply.status(201).send(userResponse);
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'User with this email already exists' });
      } else {
        reply.status(400).send({ error: 'Failed to create user', details: error.message });
      }
    }
  });

  // Admin: Update a user
  fastify.put<{
    Params: { userId: string };
    Body: {
      email?: string;
      personnummer?: string;
      firstname?: string;
      nickname?: string;
      lastname?: string;
      roles?: string[];
      groups?: string[];
      active?: boolean;
    };
  }>('/api/admin/users/:userId', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const user = await User.findByIdAndUpdate(request.params.userId, request.body, {
        new: true,
        runValidators: true,
      }).select('-foodpreference -allergys -personnummer');

      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'Email already in use' });
      } else {
        reply.status(400).send({ error: 'Failed to update user', details: error.message });
      }
    }
  });

  // Admin: Delete a user
  fastify.delete<{
    Params: { userId: string };
  }>('/api/admin/users/:userId', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const user = await User.findByIdAndDelete(request.params.userId);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.status(204).send();
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to delete user', details: error.message });
    }
  });

  // ==================== GROUP MANAGEMENT ROUTES ====================

  // Get all groups
  fastify.get('/api/groups', async (_request, reply) => {
    try {
      const groups = await Group.find()
        .populate('members', 'email firstname lastname')
        .populate('managers', 'email firstname lastname');
      reply.send({ groups });
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to fetch groups', details: error.message });
    }
  });

  // Get group by ID
  fastify.get<{
    Params: { groupId: string };
  }>('/api/groups/:groupId', async (request, reply) => {
    try {
      const group = await Group.findById(request.params.groupId)
        .populate('members', 'email firstname lastname nickname')
        .populate('managers', 'email firstname lastname');
      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }
      reply.send(group);
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid group ID', details: error.message });
    }
  });

  // Create a new group (Admin or Manager only)
  fastify.post<{
    Body: {
      name: string;
      description?: string;
    };
  }>('/api/groups', { preHandler: [requireAdminOrManager] }, async (request, reply) => {
    try {
      const group = new Group(request.body);
      await group.save();
      reply.status(201).send(group);
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'Group with this name already exists' });
      } else {
        reply.status(400).send({ error: 'Failed to create group', details: error.message });
      }
    }
  });

  // Update a group (Admin or Manager only)
  fastify.put<{
    Params: { groupId: string };
    Body: {
      name?: string;
      description?: string;
    };
  }>('/api/groups/:groupId', { preHandler: [requireAdminOrManager] }, async (request, reply) => {
    try {
      const group = await Group.findByIdAndUpdate(request.params.groupId, request.body, {
        new: true,
        runValidators: true,
      })
        .populate('members', 'email firstname lastname')
        .populate('managers', 'email firstname lastname');

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }
      reply.send(group);
    } catch (error: any) {
      if (error.code === 11000) {
        reply.status(409).send({ error: 'Group name already in use' });
      } else {
        reply.status(400).send({ error: 'Failed to update group', details: error.message });
      }
    }
  });

  // Delete a group (Admin or Manager only)
  fastify.delete<{
    Params: { groupId: string };
  }>('/api/groups/:groupId', { preHandler: [requireAdminOrManager] }, async (request, reply) => {
    try {
      const group = await Group.findByIdAndDelete(request.params.groupId);
      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }
      reply.status(204).send();
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to delete group', details: error.message });
    }
  });

  // Add user to group (Manager or Groupmanager only)
  fastify.post<{
    Params: { groupId: string; userId: string };
  }>(
    '/api/groups/:groupId/members/:userId',
    { preHandler: [requireGroupManager] },
    async (request, reply) => {
      try {
        const { groupId, userId } = request.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        // Add user to group members
        const group = await Group.findByIdAndUpdate(
          groupId,
          { $addToSet: { members: userId } },
          { new: true }
        )
          .populate('members', 'email firstname lastname')
          .populate('managers', 'email firstname lastname');

        if (!group) {
          reply.status(404).send({ error: 'Group not found' });
          return;
        }

        reply.send({ message: 'User added to group successfully', group });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to add user to group', details: error.message });
      }
    }
  );

  // Remove user from group (Manager or Groupmanager only)
  fastify.delete<{
    Params: { groupId: string; userId: string };
  }>(
    '/api/groups/:groupId/members/:userId',
    { preHandler: [requireGroupManager] },
    async (request, reply) => {
      try {
        const { groupId, userId } = request.params;

        const group = await Group.findByIdAndUpdate(
          groupId,
          { $pull: { members: userId } },
          { new: true }
        )
          .populate('members', 'email firstname lastname')
          .populate('managers', 'email firstname lastname');

        if (!group) {
          reply.status(404).send({ error: 'Group not found' });
          return;
        }

        reply.send({ message: 'User removed from group successfully', group });
      } catch (error: any) {
        reply
          .status(400)
          .send({ error: 'Failed to remove user from group', details: error.message });
      }
    }
  );

  // Add group manager (Manager only)
  fastify.post<{
    Params: { groupId: string; userId: string };
  }>(
    '/api/groups/:groupId/managers/:userId',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const { groupId, userId } = request.params;

        // Check if user exists and has groupmanager role
        const user = await User.findById(userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        if (!user.roles.includes('groupmanager')) {
          reply
            .status(400)
            .send({ error: 'User must have groupmanager role to be added as a group manager' });
          return;
        }

        // Add user as group manager
        const group = await Group.findByIdAndUpdate(
          groupId,
          { $addToSet: { managers: userId } },
          { new: true }
        )
          .populate('members', 'email firstname lastname')
          .populate('managers', 'email firstname lastname');

        if (!group) {
          reply.status(404).send({ error: 'Group not found' });
          return;
        }

        reply.send({ message: 'Group manager added successfully', group });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to add group manager', details: error.message });
      }
    }
  );

  // Remove group manager (Manager only)
  fastify.delete<{
    Params: { groupId: string; userId: string };
  }>(
    '/api/groups/:groupId/managers/:userId',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const { groupId, userId } = request.params;

        const group = await Group.findByIdAndUpdate(
          groupId,
          { $pull: { managers: userId } },
          { new: true }
        )
          .populate('members', 'email firstname lastname')
          .populate('managers', 'email firstname lastname');

        if (!group) {
          reply.status(404).send({ error: 'Group not found' });
          return;
        }

        reply.send({ message: 'Group manager removed successfully', group });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to remove group manager', details: error.message });
      }
    }
  );

  // ==================== MANAGER USER MANAGEMENT ROUTES ====================

  // Manager: Get all users (with sensitive fields)
  fastify.get('/api/manager/users', { preHandler: [requireManager] }, async (_request, reply) => {
    try {
      const users = await User.find();
      reply.send({ users });
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to fetch users', details: error.message });
    }
  });

  // Groupmanager: Get all users (with foodpreference and allergys only)
  fastify.get('/api/groupmanager/users', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const currentUser = request.user as { id: string; email: string; roles: string[] };

      // Only groupmanagers can access this endpoint
      if (!currentUser.roles || !currentUser.roles.includes('groupmanager')) {
        reply.status(403).send({ error: 'Access denied. Groupmanager role required.' });
        return;
      }

      // Check if this groupmanager has permission to view dietary info
      const user = await User.findById(currentUser.id);
      if (!user || !user.canViewAllDietaryInfo) {
        reply.status(403).send({
          error: 'Access denied. Dietary info viewing permission not granted by manager.',
        });
        return;
      }

      const users = await User.find().select('-personnummer');
      reply.send({ users });
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to fetch users', details: error.message });
    }
  });

  // Groupmanager: Get user by ID (with foodpreference and allergys only)
  fastify.get<{
    Params: { userId: string };
  }>('/api/groupmanager/users/:userId', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const currentUser = request.user as { id: string; email: string; roles: string[] };

      // Only groupmanagers can access this endpoint
      if (!currentUser.roles || !currentUser.roles.includes('groupmanager')) {
        reply.status(403).send({ error: 'Access denied. Groupmanager role required.' });
        return;
      }

      // Check if this groupmanager has permission to view dietary info
      const groupmanagerUser = await User.findById(currentUser.id);
      if (!groupmanagerUser || !groupmanagerUser.canViewAllDietaryInfo) {
        reply.status(403).send({
          error: 'Access denied. Dietary info viewing permission not granted by manager.',
        });
        return;
      }

      const user = await User.findById(request.params.userId).select('-personnummer');
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid user ID', details: error.message });
    }
  });

  // Manager: Get user by ID (with sensitive fields)
  fastify.get<{
    Params: { userId: string };
  }>('/api/manager/users/:userId', { preHandler: [requireManager] }, async (request, reply) => {
    try {
      const user = await User.findById(request.params.userId);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      reply.send(user);
    } catch (error: any) {
      reply.status(400).send({ error: 'Invalid user ID', details: error.message });
    }
  });

  // Manager: Assign groupmanager role to a user
  fastify.post<{
    Params: { userId: string };
  }>(
    '/api/manager/users/:userId/assign-groupmanager',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const user = await User.findById(request.params.userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        // Add groupmanager role if not already present
        if (!user.roles.includes('groupmanager')) {
          user.roles.push('groupmanager');
          await user.save();
        }

        reply.send({ message: 'Groupmanager role assigned successfully', user });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to assign role', details: error.message });
      }
    }
  );

  // Manager: Remove groupmanager role from a user
  fastify.delete<{
    Params: { userId: string };
  }>(
    '/api/manager/users/:userId/remove-groupmanager',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const user = await User.findById(request.params.userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        // Remove groupmanager role if present
        user.roles = user.roles.filter((role) => role !== 'groupmanager');
        await user.save();

        reply.send({ message: 'Groupmanager role removed successfully', user });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to remove role', details: error.message });
      }
    }
  );

  // Manager: Grant dietary info viewing permission to a groupmanager
  fastify.post<{
    Params: { userId: string };
  }>(
    '/api/manager/users/:userId/grant-dietary-access',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const user = await User.findById(request.params.userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        if (!user.roles.includes('groupmanager')) {
          reply.status(400).send({ error: 'User must be a groupmanager to grant dietary access' });
          return;
        }

        user.canViewAllDietaryInfo = true;
        await user.save();

        reply.send({ message: 'Dietary info viewing permission granted successfully', user });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to grant permission', details: error.message });
      }
    }
  );

  // Manager: Revoke dietary info viewing permission from a groupmanager
  fastify.delete<{
    Params: { userId: string };
  }>(
    '/api/manager/users/:userId/revoke-dietary-access',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const user = await User.findById(request.params.userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        user.canViewAllDietaryInfo = false;
        await user.save();

        reply.send({ message: 'Dietary info viewing permission revoked successfully', user });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to revoke permission', details: error.message });
      }
    }
  );

  // Manager: Update user roles (can only add/remove groupmanager)
  fastify.put<{
    Params: { userId: string };
    Body: {
      addRoles?: string[];
      removeRoles?: string[];
    };
  }>(
    '/api/manager/users/:userId/roles',
    { preHandler: [requireManager] },
    async (request, reply) => {
      try {
        const { addRoles = [], removeRoles = [] } = request.body;

        // Only allow manager to add/remove groupmanager role
        const allowedRoles = ['groupmanager'];
        const invalidAddRoles = addRoles.filter((role) => !allowedRoles.includes(role));
        const invalidRemoveRoles = removeRoles.filter((role) => !allowedRoles.includes(role));

        if (invalidAddRoles.length > 0 || invalidRemoveRoles.length > 0) {
          reply.status(403).send({
            error: 'Managers can only assign/remove groupmanager role',
            invalidRoles: [...invalidAddRoles, ...invalidRemoveRoles],
          });
          return;
        }

        const user = await User.findById(request.params.userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        // Add roles
        addRoles.forEach((role) => {
          if (!user.roles.includes(role)) {
            user.roles.push(role);
          }
        });

        // Remove roles
        user.roles = user.roles.filter((role) => !removeRoles.includes(role));

        await user.save();

        reply.send({ message: 'User roles updated successfully', user });
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to update roles', details: error.message });
      }
    }
  );

  // ==================== EVENT ROUTES ====================

  // Search/filter events
  fastify.get<{
    Querystring: {
      search?: string;
      status?: 'upcoming' | 'past' | 'all';
      group?: string;
      startDate?: string;
      endDate?: string;
    };
  }>('/api/events/search', async (request, reply) => {
    try {
      const { search, status = 'all', group, startDate, endDate } = request.query;
      const query: any = {};

      // Text search across name, description, and location
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      // Filter by date status
      const now = new Date();
      if (status === 'upcoming') {
        query.startDate = { $gte: now };
      } else if (status === 'past') {
        query.startDate = { $lt: now };
      }

      // Filter by specific date range
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) {
          query.startDate.$gte = new Date(startDate);
        }
        if (endDate) {
          query.startDate.$lte = new Date(endDate);
        }
      }

      // Filter by group
      if (group) {
        query.allowedGroups = group;
      }

      const events = await Event.find(query)
        .populate('rsvps.user', 'email firstname lastname groups')
        .sort({ startDate: status === 'past' ? -1 : 1 });

      reply.send({ events, count: events.length });
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to search events', details: error.message });
    }
  });

  // Get all events
  fastify.get('/api/events', async () => {
    const events = await Event.find().populate('rsvps.user', 'email firstname lastname groups');
    return { events };
  });

  // Create a new event
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      startDate: Date;
      endDate?: Date;
      location?: string;
      rsvpDeadline?: Date;
      allowedGroups?: string[];
      allowedUserStatus?: ('active' | 'inactive')[];
      active?: boolean;
    };
  }>('/api/events', { preHandler: [requireEventManager] }, async (request, reply) => {
    try {
      const event = new Event(request.body);
      await event.save();
      reply.status(201).send(event);
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to create event', details: error.message });
    }
  });

  // Get event by ID
  fastify.get<{
    Params: { id: string };
  }>('/api/events/:id', async (request, reply) => {
    try {
      const event = await Event.findById(request.params.id).populate(
        'rsvps.user',
        'email firstname lastname nickname groups'
      );
      if (!event) {
        reply.status(404).send({ error: 'Event not found' });
        return;
      }
      reply.send(event);
    } catch (error) {
      reply.status(400).send({ error: 'Invalid event ID' });
    }
  });

  // Update event
  fastify.put<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      location?: string;
      rsvpDeadline?: Date;
      allowedGroups?: string[];
      allowedUserStatus?: ('active' | 'inactive')[];
      active?: boolean;
    };
  }>('/api/events/:id', { preHandler: [requireEventManager] }, async (request, reply) => {
    try {
      const event = await Event.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true,
      }).populate('rsvps.user', 'email firstname lastname groups');
      if (!event) {
        reply.status(404).send({ error: 'Event not found' });
        return;
      }
      reply.send(event);
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to update event', details: error.message });
    }
  });

  // Delete event
  fastify.delete<{
    Params: { id: string };
  }>('/api/events/:id', { preHandler: [requireEventManager] }, async (request, reply) => {
    try {
      const event = await Event.findByIdAndDelete(request.params.id);
      if (!event) {
        reply.status(404).send({ error: 'Event not found' });
        return;
      }
      reply.status(204).send();
    } catch (error) {
      reply.status(400).send({ error: 'Failed to delete event' });
    }
  });

  // ==================== RSVP ROUTES ====================

  // RSVP to an event
  fastify.post<{
    Params: { eventId: string; userId: string };
    Body: { status: 'yes' | 'no' };
  }>(
    '/api/events/:eventId/rsvp/:userId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { eventId, userId } = request.params;
        const { status } = request.body;
        const currentUser = request.user as { id: string; email: string; roles: string[] };

        // Check if user is trying to RSVP for themselves or is an event manager
        const isEventManager =
          currentUser.roles &&
          currentUser.roles.some((role) => ['admin', 'manager', 'groupmanager'].includes(role));
        if (currentUser.id !== userId && !isEventManager) {
          reply.status(403).send({ error: 'You can only RSVP for yourself' });
          return;
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          reply.status(404).send({ error: 'User not found' });
          return;
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
          reply.status(404).send({ error: 'Event not found' });
          return;
        }

        // Check if user is in allowed groups (if allowedGroups is specified)
        if (event.allowedGroups && event.allowedGroups.length > 0) {
          const hasAccess = user.groups.some((group) => event.allowedGroups.includes(group));
          if (!hasAccess) {
            reply.status(403).send({ error: 'User is not in any allowed groups for this event' });
            return;
          }
        }

        // Check if user's active status is allowed for this event
        const userStatus = user.active ? 'active' : 'inactive';
        if (!event.allowedUserStatus.includes(userStatus)) {
          reply.status(403).send({
            error: `This event is only open to ${event.allowedUserStatus.join(' and ')} users`,
          });
          return;
        }

        // Remove existing RSVP if any
        await Event.findByIdAndUpdate(eventId, {
          $pull: { rsvps: { user: userId } },
        });

        // Add new RSVP
        const updatedEvent = await Event.findByIdAndUpdate(
          eventId,
          {
            $push: {
              rsvps: {
                user: userId,
                status,
                respondedAt: new Date(),
              },
            },
          },
          { new: true }
        ).populate('rsvps.user', 'email firstname lastname groups');

        reply.send(updatedEvent);
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to RSVP', details: error.message });
      }
    }
  );

  // Remove RSVP from event
  fastify.delete<{
    Params: { eventId: string; userId: string };
  }>(
    '/api/events/:eventId/rsvp/:userId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { eventId, userId } = request.params;
        const currentUser = request.user as { id: string; email: string; roles: string[] };

        // Check if user is trying to remove their own RSVP or is an event manager
        const isEventManager =
          currentUser.roles &&
          currentUser.roles.some((role) => ['admin', 'manager', 'groupmanager'].includes(role));
        if (currentUser.id !== userId && !isEventManager) {
          reply.status(403).send({ error: 'You can only remove your own RSVP' });
          return;
        }

        const event = await Event.findByIdAndUpdate(
          eventId,
          { $pull: { rsvps: { user: userId } } },
          { new: true }
        ).populate('rsvps.user', 'email firstname lastname groups');

        if (!event) {
          reply.status(404).send({ error: 'Event not found' });
          return;
        }

        reply.send(event);
      } catch (error: any) {
        reply.status(400).send({ error: 'Failed to remove RSVP', details: error.message });
      }
    }
  );

  // Get all events for a specific user (where they have RSVP'd)
  fastify.get<{
    Params: { userId: string };
  }>('/api/users/:userId/events', async (request, reply) => {
    try {
      const events = await Event.find({ 'rsvps.user': request.params.userId }).populate(
        'rsvps.user',
        'email firstname lastname groups'
      );
      reply.send({ events });
    } catch (error: any) {
      reply.status(400).send({ error: 'Failed to fetch user events', details: error.message });
    }
  });

  // Get events available to a user based on their groups
  fastify.get<{
    Params: { userId: string };
  }>('/api/users/:userId/available-events', async (request, reply) => {
    try {
      const user = await User.findById(request.params.userId);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }

      // Find events where user's groups match allowedGroups or no groups are specified
      const userStatus = user.active ? 'active' : 'inactive';
      const events = await Event.find({
        $and: [
          {
            $or: [
              { allowedGroups: { $in: user.groups } },
              { allowedGroups: { $size: 0 } },
              { allowedGroups: { $exists: false } },
            ],
          },
          {
            allowedUserStatus: userStatus,
          },
        ],
      }).populate('rsvps.user', 'email firstname lastname groups');

      reply.send({ events });
    } catch (error: any) {
      reply.status(400).send({
        error: 'Failed to fetch available events',
        details: error.message,
      });
    }
  });
}

export default routes;
