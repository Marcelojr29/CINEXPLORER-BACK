import { FastifyRequest, FastifyReply } from 'fastify'

interface UserPayload {
  id: string
  email: string
}

export async function authenticate(request: FastifyRequest & { user?: UserPayload }, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify()
    request.user = payload
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}