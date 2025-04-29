import { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify()
    request.user = payload
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}