import { FastifyRequest, FastifyReply } from 'fastify'
import { registerUser, loginUser } from '../auth/service.js'
import { registerSchema, loginSchema } from '../auth/schemas.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    try {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          error: 'No autenticado'
        })
      }

      // Obtener información completa del usuario
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              assignedAssets: true
            }
          }
        }
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'Usuario no encontrado'
        })
      }

      return reply.send({
        success: true,
        data: {
          user
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error interno del servidor'
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }
}

