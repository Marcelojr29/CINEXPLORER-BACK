import fastify from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastifyJwt } from '@fastify/jwt'
import { fastifyAuth } from '@fastify/auth'
import { validatorCompiler, serializerCompiler, jsonSchemaTransform, ZodTypeProvider } from 'fastify-type-provider-zod'
import { env } from '../lib/env'
import { authRoutes } from '../modules/auth/routes'
import { cinemaRoutes } from '../modules/cinemas/routes'
import { movieRoutes } from '../modules/movies/routes'
import { sessionRoutes } from '../modules/sessions/routes'
import { purchaseRoutes } from '../modules/purchases/routes'
import { adminRoutes } from '../modules/admin/routes'

export const app = fastify({
    logger: true
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})

app.register(fastifyJwt, {
    secret: env.JWT_SECRET
})

app.register(fastifyAuth)

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'cineXplorer API',
            description: 'API para gerenciamento de cinemas, sessões e compras de ingressos',
            version: '1.0.0'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    }
})

app.register(authRoutes, { prefix: 'auth' })
app.register(cinemaRoutes, { prefix: '/cinemas' })
app.register(movieRoutes, {prefix: '/movies' })
app.register(sessionRoutes, { prefix: '/sessions' })
app.register(purchaseRoutes, { prefix: '/purchases' })
app.register(adminRoutes, { prefix: '/admin' })

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
    console.log(`Server running on http://localhost:${env.PORT}`)
    console.log(`Documentation available on http://localhost:${env.PORT}/docs`)
})
