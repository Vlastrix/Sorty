import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { registerSchema, loginSchema } from './auth/schemas.js'
import { registerUser, loginUser } from './auth/service.js'
import { authenticateUser } from './auth/middleware.js'

const app = Fastify()
await app.register(cors, { origin: true })

const prisma = new PrismaClient()

app.get('/health', async () => {
  return { ok: true }
})

// Auth routes
app.post('/auth/register', async (request, reply) => {
  try {
    const body = registerSchema.parse(request.body)
    const result = await registerUser(body)
    
    return reply.status(201).send({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    
    if (message === 'El usuario ya existe') {
      return reply.status(409).send({
        success: false,
        error: message
      })
    }
    
    return reply.status(400).send({
      success: false,
      error: message
    })
  }
})

app.post('/auth/login', async (request, reply) => {
  try {
    const body = loginSchema.parse(request.body)
    const result = await loginUser(body)
    
    return reply.send({
      success: true,
      message: 'Login exitoso',
      data: result
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    
    return reply.status(401).send({
      success: false,
      error: message
    })
  }
})

// Protected route example
app.get('/auth/me', { preHandler: authenticateUser }, async (request) => {
  return {
    success: true,
    data: {
      user: request.user
    }
  }
})

// Assets route (now protected)
app.get('/assets', { preHandler: authenticateUser }, async () => {
  const items = await prisma.asset.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
  const out = items.map(a => ({
    id: a.id, code: a.code, name: a.name, categoryName: a.category?.name ?? ''
  }))
  return { items: out }
})

const port = Number(process.env.PORT || 4000)
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`API on http://localhost:${port}`)
})