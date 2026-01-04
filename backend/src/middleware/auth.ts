import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized. Please log in.' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string; email: string; roles: string[] };

    if (!user.roles || !user.roles.includes('admin')) {
      reply.status(403).send({ error: 'Access denied. Admin role required.' });
    }
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized. Please log in.' });
  }
}

export async function requireManager(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string; email: string; roles: string[] };

    if (!user.roles || !user.roles.includes('manager')) {
      reply.status(403).send({ error: 'Access denied. Manager role required.' });
    }
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized. Please log in.' });
  }
}

export async function requireEventManager(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string; email: string; roles: string[] };

    const allowedRoles = ['admin', 'manager', 'groupmanager'];
    const hasPermission = user.roles && user.roles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      reply
        .status(403)
        .send({ error: 'Access denied. Admin, Manager, or Groupmanager role required.' });
    }
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized. Please log in.' });
  }
}

export async function requireAdminOrManager(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string; email: string; roles: string[] };

    const allowedRoles = ['admin', 'manager'];
    const hasPermission = user.roles && user.roles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      reply.status(403).send({ error: 'Access denied. Admin or Manager role required.' });
    }
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized. Please log in.' });
  }
}

export async function requireGroupManager(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string; email: string; roles: string[] };

    // Managers have access to all groups
    if (user.roles && user.roles.includes('manager')) {
      return;
    }

    // Groupmanagers need to be verified as managers of the specific group
    if (user.roles && user.roles.includes('groupmanager')) {
      const params = request.params as { groupId?: string };

      if (!params.groupId) {
        reply.status(400).send({ error: 'Group ID is required' });
        return;
      }

      // Import Group model dynamically to avoid circular dependencies
      const { Group } = await import('../models/Group.js');

      const group = await Group.findById(params.groupId);

      if (!group) {
        reply.status(404).send({ error: 'Group not found' });
        return;
      }

      // Check if user is in the managers array of this specific group
      const isGroupManager = group.managers.some((managerId) => managerId.toString() === user.id);

      if (!isGroupManager) {
        reply.status(403).send({
          error: 'Access denied. You are not a manager of this group.',
        });
        return;
      }

      return;
    }

    reply.status(403).send({ error: 'Access denied. Manager or Groupmanager role required.' });
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized. Please log in.' });
  }
}
