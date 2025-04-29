import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticate } from '../auth/plugins/authenticate'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Admin login',
      body: z.object({
        email: z.string().email(),
        password: z.string().min(6)
      }),
      response: {
        200: z.object({
          token: z.string()
        }),
        401: z.object({
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as {
      email: string
      password: string
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return reply.status(401).send({ message: 'Invalid credentials' })
    }

    const token = app.jwt.sign({
      id: admin.id,
      name: admin.name,
      email: admin.email
    }, {
      expiresIn: '7d'
    })

    return { token }
  })

  app.get('/me', {
    schema: {
      tags: ['Auth'],
      summary: 'Get current admin info',
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          id: z.string().uuid(),
          name: z.string(),
          email: z.string().email()
        })
      }
    },
    onRequest: [authenticate]
  }, async (request) => {
    return request.user
  })
}