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
        userCpf: z.string().optional(),
        quantity: z.number().int().positive().max(10),
        ticketTypeId: z.string().uuid()
      }),
      response: {
        201: z.object({
          id: z.string().uuid(),
          sessionId: z.string().uuid(),
          userEmail: z.string().email(),
          quantity: z.number(),
          ticketType: z.object({
            name: z.string(),
            discountPercentage: z.number()
          }),
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
    const { sessionId, userEmail, userCpf, quantity, ticketTypeId } = request.body as {
      sessionId: string
      userEmail: string
      userCpf?: string
      quantity: number
      ticketTypeId: string
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

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId }
    })

    if (!ticketType) {
      return reply.status(404).send({ message: 'Ticket type not found' })
    }

    // Verifica se há assentos disponíveis (simulação de 50 assentos por sessão)
    const purchasedSeats = session.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0)
    const availableSeats = 50 - purchasedSeats

    if (quantity > availableSeats) {
      return reply.status(400).send({ message: `Not enough available seats. Only ${availableSeats} left.` })
    }

    const discountedPrice = session.price * (1 - (ticketType.discountPercentage / 100))
    const totalPrice = discountedPrice * quantity
    
    // Cria a compra
    const purchase = await prisma.purchase.create({
      data: {
        sessionId,
        userEmail,
        userCpf: userCpf || null,
        quantity,
        ticketTypeId,
        totalPrice
      },
      include: {
        ticketType: true
      }
    })

    // TODO: Enviar e-mail de confirmação (integração futura)

    return reply.status(201).send({
      id: purchase.id,
      sessionId: purchase.sessionId,
      userEmail: purchase.userEmail,
      quantity: purchase.quantity,
      ticketType: {
        name: purchase.ticketType.name,
        discountPercentage: purchase.ticketType.discountPercentage
      },
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