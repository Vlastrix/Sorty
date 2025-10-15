import { FastifyRequest, FastifyReply } from 'fastify'
import { registerUser, loginUser } from '../auth/service.js'
import { registerSchema, loginSchema } from '../auth/schemas.js'

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
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
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
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
  }

  static async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      data: {
        user: (request as any).user
      }
    })
  }
}
