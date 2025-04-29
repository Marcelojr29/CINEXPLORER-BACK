import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticate } from '../auth/plugins/authenticate'

export async function adminRoutes(app: FastifyInstance) {
  app.register(async (adminApp) => {
    adminApp.addHook('onRequest', authenticate)

    adminApp.post('/admins', {
      schema: {
        tags: ['Admin - Management'],
        summary: 'Create a new admin',
        security: [{ bearerAuth: [] }],
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(6)
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email()
          }),
          409: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { name, email, password } = request.body as {
        name: string
        email: string
        password: string
      }

      const adminExists = await prisma.admin.findUnique({
        where: { email }
      })

      if (adminExists) {
        return reply.status(409).send({ message: 'Admin already exists' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })

      return reply.status(201).send({
        id: admin.id,
        name: admin.name,
        email: admin.email
      })
    })

    adminApp.get('/admins', {
      schema: {
        tags: ['Admin - Management'],
        summary: 'List all admins',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string().datetime()
          }))
        }
      }
    }, async () => {
      const admins = await prisma.admin.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return admins.map(admin => ({
        ...admin,
        createdAt: admin.createdAt.toISOString()
      }))
    })

    adminApp.delete('/admins/:id', {
      schema: {
        tags: ['Admin - Management'],
        summary: 'Delete an admin',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        response: {
          204: z.void(),
          400: z.object({
            message: z.string()
          }),
          404: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params as { id: string }

      // Não permitir deletar a si mesmo
      if (id === (request.user as { id: string }).id) {
        return reply.status(400).send({ message: 'You cannot delete yourself' })
      }

      try {
        await prisma.admin.delete({
          where: { id }
        })

        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ message: 'Admin not found' })
      }
    })
  })
}