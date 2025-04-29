import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../auth/plugins/authenticate'

export async function movieRoutes(app: FastifyInstance) {
  app.get('/movies', {
    schema: {
      tags: ['Movies'],
      summary: 'List all movies',
      querystring: z.object({
        title: z.string().optional(),
        genre: z.string().optional(),
        rating: z.string().optional()
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          title: z.string(),
          genre: z.string(),
          duration: z.number(),
          rating: z.string(),
          description: z.string().nullable(),
          imageUrl: z.string().nullable()
        }))
      }
    }
  }, async (request) => {
    const { title, genre, rating } = request.query as {
      title?: string
      genre?: string
      rating?: string
    }

    const movies = await prisma.movie.findMany({
      where: {
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        genre: genre ? { contains: genre, mode: 'insensitive' } : undefined,
        rating: rating ? { equals: rating, mode: 'insensitive' } : undefined
      }
    })

    return movies
  })

  app.get('/movies/:id', {
    schema: {
      tags: ['Movies'],
      summary: 'Get movie details',
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          id: z.string().uuid(),
          title: z.string(),
          genre: z.string(),
          duration: z.number(),
          rating: z.string(),
          description: z.string().nullable(),
          imageUrl: z.string().nullable(),
          sessions: z.array(z.object({
            id: z.string().uuid(),
            dateTime: z.string().datetime(),
            roomType: z.string(),
            price: z.number(),
            cinema: z.object({
              id: z.string().uuid(),
              name: z.string(),
              address: z.string(),
              city: z.string()
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

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            cinema: true
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

    if (!movie) {
      return reply.status(404).send({ message: 'Movie not found' })
    }

    return {
      ...movie,
      sessions: movie.sessions.map(session => ({
        id: session.id,
        dateTime: session.dateTime.toISOString(),
        roomType: session.roomType,
        price: session.price,
        cinema: {
          id: session.cinema.id,
          name: session.cinema.name,
          address: session.cinema.address,
          city: session.cinema.city
        }
      }))
    }
  })

  // Rotas protegidas para administradores
  app.register(async (adminApp) => {
    adminApp.addHook('onRequest', authenticate)

    adminApp.post('/movies', {
      schema: {
        tags: ['Admin - Movies'],
        summary: 'Create a new movie',
        security: [{ bearerAuth: [] }],
        body: z.object({
          title: z.string().min(3),
          genre: z.string().min(3),
          duration: z.number().positive(),
          rating: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().url().optional()
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            title: z.string(),
            genre: z.string(),
            duration: z.number(),
            rating: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { title, genre, duration, rating, description, imageUrl } = request.body as {
        title: string
        genre: string
        duration: number
        rating: string
        description?: string
        imageUrl?: string
      }

      const movie = await prisma.movie.create({
        data: {
          title,
          genre,
          duration,
          rating,
          description,
          imageUrl
        }
      })

      return reply.status(201).send(movie)
    })

    adminApp.put('/movies/:id', {
      schema: {
        tags: ['Admin - Movies'],
        summary: 'Update a movie',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          title: z.string().min(3).optional(),
          genre: z.string().min(3).optional(),
          duration: z.number().positive().optional(),
          rating: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().url().optional()
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            title: z.string(),
            genre: z.string(),
            duration: z.number(),
            rating: z.string()
          }),
          404: z.object({
            message: z.string()
          })
        }
      }
    }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const data = request.body as {
        title?: string
        genre?: string
        duration?: number
        rating?: string
        description?: string
        imageUrl?: string
      }

      try {
        const movie = await prisma.movie.update({
          where: { id },
          data
        })

        return movie
      } catch {
        return reply.status(404).send({ message: 'Movie not found' })
      }
    })

    adminApp.delete('/movies/:id', {
      schema: {
        tags: ['Admin - Movies'],
        summary: 'Delete a movie',
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
        await prisma.movie.delete({
          where: { id }
        })

        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ message: 'Movie not found' })
      }
    })
  })
}