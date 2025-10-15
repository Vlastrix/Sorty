import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller.js'
import { authenticateUser } from '../auth/middleware.js'

export async function authRoutes(app: FastifyInstance) {
  // Rutas públicas
  app.post('/register', AuthController.register)
  app.post('/login', AuthController.login)
  
  // Rutas protegidas
  app.get('/me', { preHandler: authenticateUser }, AuthController.me)
}
