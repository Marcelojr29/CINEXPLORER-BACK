import 'fastify'
import '@fastify/jwt'

interface UserPayload {
  id: string
  email: string
}

declare module 'fastify' {
  interface FastifyRequest {
    jwtVerify(): Promise<UserPayload>
  }
} 