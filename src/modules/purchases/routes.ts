import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { randomUUID } from 'node:crypto'

export async function purchaseRoutes(app: FastifyInstance) {
  app.post('/purchases', {
    schema: {
      tags: ['Purchases'],
      summary: 'Create a new purchase',
      body: z.object({
        sessionId: z.string().uuid(),
        userEmail: z.string().email(),
        quantity: z.number().int().positive().max(10)
      }),
      response: {
        201: z.object({
          id: z.string().uuid(),
          sessionId: z.string().uuid(),
          userEmail: z.string().email(),
          quantity: z.number(),
          totalPrice: z.number(),
          purchaseDate: z.string().datetime()
        }),
        400: z.object({
          message: z.string()
        }),
        404: z.object({
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { sessionId, userEmail, quantity } = request.body as {
      sessionId: string
      userEmail: string
      quantity: number
    }

    // Verifica se a sessão existe
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        purchases: true
      }
    })

    if (!session) {
      return reply.status(404).send({ message: 'Session not found' })
    }

    // Verifica se há assentos disponíveis (simulação de 50 assentos por sessão)
    const purchasedSeats = session.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0)
    const availableSeats = 50 - purchasedSeats

    if (quantity > availableSeats) {
      return reply.status(400).send({ message: `Not enough available seats. Only ${availableSeats} left.` })
    }

    // Cria a compra
    const totalPrice = session.price * quantity
    const purchaseId = randomUUID()

    const purchase = await prisma.purchase.create({
      data: {
        id: purchaseId,
        sessionId,
        userEmail,
        quantity,
        totalPrice
      }
    })

    // TODO: Enviar e-mail de confirmação (integração futura)

    return reply.status(201).send({
      id: purchase.id,
      sessionId: purchase.sessionId,
      userEmail: purchase.userEmail,
      quantity: purchase.quantity,
      totalPrice: purchase.totalPrice,
      purchaseDate: purchase.createdAt.toISOString()
    })
  })

  app.get('/purchases/:id', {
    schema: {
      tags: ['Purchases'],
      summary: 'Get purchase details',
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          id: z.string().uuid(),
          session: z.object({
            id: z.string().uuid(),
            dateTime: z.string().datetime(),
            roomType: z.string(),
            price: z.number(),
            movie: z.object({
              id: z.string().uuid(),
              title: z.string(),
              duration: z.number()
            }),
            cinema: z.object({
              id: z.string().uuid(),
              name: z.string(),
              address: z.string()
            })
          }),
          userEmail: z.string().email(),
          quantity: z.number(),
          totalPrice: z.number(),
          purchaseDate: z.string().datetime()
        }),
        404: z.object({
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            movie: true,
            cinema: true
          }
        }
      }
    })

    if (!purchase) {
      return reply.status(404).send({ message: 'Purchase not found' })
    }

    return {
      id: purchase.id,
      session: {
        id: purchase.sessions.id,
        dateTime: purchase.sessions.dateTime.toISOString(),
        roomType: purchase.sessions.roomType,
        price: purchase.sessions.price,
        movie: {
          id: purchase.sessions.movie.id,
          title: purchase.sessions.movie.title,
          duration: purchase.sessions.movie.duration
        },
        cinema: {
          id: purchase.sessions.cinema.id,
          name: purchase.sessions.cinema.name,
          address: purchase.sessions.cinema.address
        }
      },
      userEmail: purchase.userEmail,
      quantity: purchase.quantity,
      totalPrice: purchase.totalPrice,
      purchaseDate: purchase.createdAt.toISOString()
    }
  })
}