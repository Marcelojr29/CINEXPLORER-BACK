import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../auth/plugins/authenticate'

export async function cinemaRoutes(app: FastifyInstance) {
  app.get('/cinemas', {
    schema: {
      tags: ['Cinemas'],
      summary: 'List all cinemas',
      querystring: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radius: z.number().optional().default(10)
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          name: z.string(),
          address: z.string(),
          city: z.string(),
          state: z.string(),
          latitude: z.number().nullable(),
          longitude: z.number().nullable(),
          distance: z.number().optional()
        }))
      }
    }
  }, async (request, reply) => {
    const { city, state, latitude, longitude, radius } = request.query as {
      city?: string
      state?: string
      latitude?: number
      longitude?: number
      radius?: number
    }

    if (latitude && longitude) {
      // Busca por proximidade geográfica
      const cinemas = await prisma.$queryRaw`
        SELECT 
          id, name, address, city, state, latitude, longitude,
          (6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(latitude))
          )) AS distance
        FROM cinemas
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING distance <= ${radius}
        ORDER BY distance
      `
      return cinemas
    }

    // Busca por cidade/estado
    const cinemas = await prisma.cinema.findMany({
      where: {
        city: city ? { contains: city, mode: 'insensitive' } : undefined,
        state: state ? { equals: state, mode: 'insensitive' } : undefined
      }
    })

    return cinemas
  })

  app.get('/cinemas/:id', {
    schema: {
      tags: ['Cinemas'],
      summary: 'Get cinema details',
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          id: z.string().uuid(),
          name: z.string(),
          address: z.string(),
          city: z.string(),
          state: z.string(),
          latitude: z.number().nullable(),
          longitude: z.number().nullable(),
          sessions: z.array(z.object({
            id: z.string().uuid(),
            dateTime: z.string().datetime(),
            roomType: z.string(),
            price: z.number(),
            movie: z.object({
              id: z.string().uuid(),
              title: z.string(),
              genre: z.string(),
              duration: z.number(),
              rating: z.string(),
              imageUrl: z.string().nullable()
            })
          }))
        }),
        404: z.object({
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const cinema = await prisma.cinema.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            movie: true
          },
          where: {
            dateTime: {
              gte: new Date()
            }
          },
          orderBy: {
            dateTime: 'asc'
          }
        }
      }
    })

    if (!cinema) {
      return reply.status(404).send({ message: 'Cinema not found' })
    }

    return {
      ...cinema,
      sessions: cinema.sessions.map(session => ({
        id: session.id,
        dateTime: session.dateTime.toISOString(),
        roomType: session.roomType,
        price: session.price,
        movie: {
          id: session.movie.id,
          title: session.movie.title,
          genre: session.movie.genre,
          duration: session.movie.duration,
          rating: session.movie.rating,
          imageUrl: session.movie.imageUrl
        }
      }))
    }
  })

  // Rotas protegidas para administradores
  app.register(async (adminApp) => {
    adminApp.addHook('onRequest', authenticate)

    adminApp.post('/cinemas', {
      schema: {
        tags: ['Admin - Cinemas'],
        summary: 'Create a new cinema',
        security: [{ bearerAuth: [] }],
        body: z.object({
          name: z.string().min(3),
          address: z.string().min(5),
          city: z.string().min(3),
          state: z.string().length(2),
          latitude: z.number().optional(),
          longitude: z.number().optional()
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            name: z.string(),
            address: z.string(),
            city: z.string(),
            state: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { name, address, city, state, latitude, longitude } = request.body as {
        name: string
        address: string
        city: string
        state: string
        latitude: number
        longitude: number
      }

      const cinema = await prisma.cinema.create({
        data: {
          name,
          address,
          city,
          state,
          latitude,
          longitude
        }
      })

      return reply.status(201).send(cinema)
    })

    adminApp.put('/cinemas/:id', {
      schema: {
        tags: ['Admin - Cinemas'],
        summary: 'Update a cinema',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          name: z.string().min(3).optional(),
          address: z.string().min(5).optional(),
          city: z.string().min(3).optional(),
          state: z.string().length(2).optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional()
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            name: z.string(),
            address: z.string(),
            city: z.string(),
            state: z.string()
          }),
          404: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const data = request.body as {
        name?: string
        address?: string
        city?: string
        state?: string
        latitude?: number
        longitude?: number
      }

      try {
        const cinema = await prisma.cinema.update({
          where: { id },
          data
        })

        return cinema
      } catch {
        return reply.status(404).send({ message: 'Cinema not found' })
      }
    })

    adminApp.delete('/cinemas/:id', {
      schema: {
        tags: ['Admin - Cinemas'],
        summary: 'Delete a cinema',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        response: {
          204: z.void(),
          404: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params as { id: string }

      try {
        await prisma.cinema.delete({
          where: { id }
        })

        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ message: 'Cinema not found' })
      }
    })
  })
}