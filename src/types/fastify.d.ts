import 'fastify'
import '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    jwtVerify(): Promise<{
      id: string
      email: string
    }>
  }
} 