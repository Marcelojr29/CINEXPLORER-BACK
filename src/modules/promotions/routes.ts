import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prisma } from "../../lib/prisma";
import { authenticate } from "../auth/plugins/authenticate";

export async function promotionRoutes(app: FastifyInstance) {
    app.get('/promotions', {
        schema: {
            tags: ['Promotions'],
            summary: 'List active promotions',
            querystring: z.object({
                cinemaId: z.string().uuid().optional(),
                movieId: z.string().uuid().optional()
            }),
            response: {
                200: z.array(z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    description: z.string(),
                    discountPercetange: z.number(),
                    startDate: z.string().datetime(),
                    endDate: z.string().datetime(),
                    cinema: z.object({
                        id: z.string().uuid(),
                        name: z.string()
                    }).nullable(),
                    movie: z.object({
                        id: z.string().uuid(),
                        title: z.string()
                    }).nullable()
                }))
            }
        }
    }, async (request) => {
        const { cinemaId, movieId } = request.query as {
            cinemaId?: string
            movieId?: string
        }
        const now = new Date()

        const promotions = await prisma.promotion.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                cinemaId: cinemaId || undefined,
                movieId: movieId || undefined
            },
            include: {
                cinema: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                movie: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        return promotions.map((promo: any)=> ({
            ...promo,
            startDate: promo.startDate.toISOString(),
            endDate: promo.endDate.toISOString(),
            cinema: promo.cinema ? {
                id: promo.cinema.id,
                name: promo.cinema.name
            } : null,
            movile: promo.movie ? {
                id: promo.movie.id,
                title: promo.movie.title
            } : null
        }))
    })
}