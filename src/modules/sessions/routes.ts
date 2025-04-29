import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../auth/plugins/authenticate'

export async function sessionRoutes(app: FastifyInstance) {
  app.get('/sessions', {
    schema: {
      tags: ['Sessions'],
      summary: 'List all sessions with filters',
      querystring: z.object({
        cinemaId: z.string().uuid().optional(),
        movieId: z.string().uuid().optional(),
        date: z.string().datetime().optional(),
        roomType: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional()
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          dateTime: z.string().datetime(),
          roomType: z.string(),
          price: z.number(),
          cinema: z.object({
            id: z.string().uuid(),
            name: z.string(),
            address: z.string(),
            city: z.string()
          }),
          movie: z.object({
            id: z.string().uuid(),
            title: z.string(),
            genre: z.string(),
            duration: z.number(),
            rating: z.string()
          })
        }))
      }
    }
  }, async (request) => {
    const { cinemaId, movieId, date, roomType, minPrice, maxPrice } = request.query as {
      cinemaId?: string
      movieId?: string
      date?: string
      roomType?: string
      minPrice?: number
      maxPrice?: number
    }

    const sessions = await prisma.session.findMany({
      where: {
        cinemaId,
        movieId,
        dateTime: date ? {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        } : {
          gte: new Date()
        },
        roomType: roomType ? { equals: roomType, mode: 'insensitive' } : undefined,
        price: {
          gte: minPrice,
          lte: maxPrice
        }
      },
      include: {
        cinema: true,
        movie: true
      },
      orderBy: {
        dateTime: 'asc'
      }
    })

    return sessions.map(session => ({
      id: session.id,
      dateTime: session.dateTime.toISOString(),
      roomType: session.roomType,
      price: session.price,
      cinema: {
        id: session.cinema.id,
        name: session.cinema.name,
        address: session.cinema.address,
        city: session.cinema.city
      },
      movie: {
        id: session.movie.id,
        title: session.movie.title,
        genre: session.movie.genre,
        duration: session.movie.duration,
        rating: session.movie.rating
      }
    }))
  })

  app.get('/sessions/:id', {
    schema: {
      tags: ['Sessions'],
      summary: 'Get session details',
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          id: z.string().uuid(),
          dateTime: z.string().datetime(),
          roomType: z.string(),
          price: z.number(),
          cinema: z.object({
            id: z.string().uuid(),
            name: z.string(),
            address: z.string(),
            city: z.string()
          }),
          movie: z.object({
            id: z.string().uuid(),
            title: z.string(),
            genre: z.string(),
            duration: z.number(),
            rating: z.string(),
            imageUrl: z.string().nullable()
          }),
          availableSeats: z.number()
        }),
        404: z.object({
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        cinema: true,
        movie: true,
        purchases: true
      }
    })

    if (!session) {
      return reply.status(404).send({ message: 'Session not found' })
    }

    // Simulação de assentos disponíveis (50 assentos por sessão)
    const availableSeats = 50 - session.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0)

    return {
      id: session.id,
      dateTime: session.dateTime.toISOString(),
      roomType: session.roomType,
      price: session.price,
      cinema: {
        id: session.cinema.id,
        name: session.cinema.name,
        address: session.cinema.address,
        city: session.cinema.city
      },
      movie: {
        id: session.movie.id,
        title: session.movie.title,
        genre: session.movie.genre,
        duration: session.movie.duration,
        rating: session.movie.rating,
        imageUrl: session.movie.imageUrl
      },
      availableSeats
    }
  })

  // Rotas protegidas para administradores
  app.register(async (adminApp) => {
    adminApp.addHook('onRequest', authenticate)

    adminApp.post('/sessions', {
      schema: {
        tags: ['Admin - Sessions'],
        summary: 'Create a new session',
        security: [{ bearerAuth: [] }],
        body: z.object({
          cinemaId: z.string().uuid(),
          movieId: z.string().uuid(),
          dateTime: z.string().datetime(),
          roomType: z.string(),
          price: z.number().positive()
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            dateTime: z.string().datetime(),
            roomType: z.string(),
            price: z.number()
          })
        }
      }
    }, async (request, reply) => {
      const { cinemaId, movieId, dateTime, roomType, price } = request.body as {
        cinemaId: string
        movieId: string
        dateTime: string
        roomType: string
        price: number
      }

      const session = await prisma.session.create({
        data: {
          cinemaId,
          movieId,
          dateTime: new Date(dateTime),
          roomType,
          price
        }
      })

      return reply.status(201).send({
        id: session.id,
        dateTime: session.dateTime.toISOString(),
        roomType: session.roomType,
        price: session.price
      })
    })

    adminApp.put('/sessions/:id', {
      schema: {
        tags: ['Admin - Sessions'],
        summary: 'Update a session',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          dateTime: z.string().datetime().optional(),
          roomType: z.string().optional(),
          price: z.number().positive().optional()
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            dateTime: z.string().datetime(),
            roomType: z.string(),
            price: z.number()
          }),
          404: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const data = request.body as {
        dateTime?: string
        roomType?: string
        price?: number
      }

      try {
        const session = await prisma.session.update({
          where: { id },
          data: {
            ...(data.dateTime && { dateTime: new Date(data.dateTime) }),
            ...(data.roomType && { roomType: data.roomType }),
            ...(data.price && { price: data.price })
          }
        })

        return {
          id: session.id,
          dateTime: session.dateTime.toISOString(),
          roomType: session.roomType,
          price: session.price
        }
      } catch {
        return reply.status(404).send({ message: 'Session not found' })
      }
    })

    adminApp.delete('/sessions/:id', {
      schema: {
        tags: ['Admin - Sessions'],
        summary: 'Delete a session',
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
        await prisma.session.delete({
          where: { id }
        })

        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ message: 'Session not found' })
      }
    })
  })
}