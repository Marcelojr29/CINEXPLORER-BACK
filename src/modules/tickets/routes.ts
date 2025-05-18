import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from '../../lib/prisma';
import { authenticate } from "../auth/plugins/authenticate";

export async function ticketRoutes(app: FastifyInstance) {
    app.register(async (adminApp) => {
        adminApp.addHook('onRequest', authenticate)

        adminApp.post('/ticket-types', {
            schema: {
                tags: ['Admin - Ticket Types'],
                summary: 'Create a new Ticket type',
                security: [{ bearerAuth: [] }],
                body: z.object({
                    name: z.string().min(3),
                    description: z.string().min(10),
                    discountPercentage: z.number().min(0).max(100),
                    requiresProof: z.boolean()
                }),
                response: {
                    201: z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        discountPercentage: z.number(),
                        requiresProof: z.boolean()
                    })
                }
            }
        }, async (request, reply) => {
            const { name, description, discountPercentage, requiresProof } = request.body as {
                name: string
                description: string
                discountPercentage: number
                requiresProof: boolean
            }

            const ticketType = await prisma.ticketType.create({
                data: {
                    name,
                    description,
                    discountPercentage,
                    requiresProof
                }
            })

            return reply.status(201).send(ticketType)
        })

        adminApp.get('/ticket-types', {
            schema: {
                tags: ['Admin - Ticket Types'],
                summary: 'List all ticket types',
                security: [{ bearerAuth: [] }],
                response: {
                    200: z.array(z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        description: z.string(),
                        discountPercentage: z.number(),
                        requiresProof: z.boolean()
                    }))
                }
            }
        }, async () => {
            return await prisma.ticketType.findMany()
        })
    })
}