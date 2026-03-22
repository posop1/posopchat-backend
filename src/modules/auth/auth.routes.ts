import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  fastify.post('/register', {
    handler: async (request, reply) => {
      try {
        const { username, email, password, name } = request.body as {
          username: string;
          email: string;
          password: string;
          name?: string;
        };

        const user = await authService.register({
          username,
          email,
          password,
          name
        });

        return reply.code(201).send(user);
      } catch (error: any) {
        fastify.log.error(error);
        if (error.code === 'P2002') {
          return reply.code(409).send({
            error: 'User with this email or username already exists'
          });
        } else {
          return reply.code(500).send({ error: 'Internal server error' });
        }
      }
    }
  });

  fastify.post('/login', {
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body as {
          email: string;
          password: string;
        };

        const user = await authService.login(email, password);

        const token = fastify.jwt.sign({
          id: user.id,
          email: user.email
        });

        return reply.send({ token, user });
      } catch (error: any) {
        fastify.log.error(error);
        if (error.message === 'Invalid credentials') {
          return reply.code(401).send({ error: 'Invalid credentials' });
        } else {
          return reply.code(500).send({ error: 'Internal server error' });
        }
      }
    }
  });
}
