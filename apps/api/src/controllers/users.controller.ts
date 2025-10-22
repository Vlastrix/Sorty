import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import * as userService from '../auth/userService.js'

// Schemas de validación
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().optional(),
  role: z.nativeEnum(UserRole)
})

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  name: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional()
})

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
})

export class UserController {
  /**
   * Obtener todos los usuarios (solo admin)
   */
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getAllUsers()
      
      return reply.send({
        success: true,
        data: users
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener usuarios'
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const user = await userService.getUserById(id)
      
      return reply.send({
        success: true,
        data: user
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener usuario'
      
      if (message === 'Usuario no encontrado') {
        return reply.status(404).send({
          success: false,
          error: message
        })
      }
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }

  /**
   * Crear nuevo usuario (solo admin)
   */
  static async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = createUserSchema.parse(request.body)
      const user = await userService.createUser(body)
      
      return reply.status(201).send({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear usuario'
      
      if (message === 'El correo electrónico ya está registrado') {
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

  /**
   * Actualizar usuario (admin puede actualizar cualquier usuario)
   */
  static async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const body = updateUserSchema.parse(request.body)
      
      const user = await userService.updateUser(id, body)
      
      return reply.send({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario'
      
      if (message === 'Usuario no encontrado') {
        return reply.status(404).send({
          success: false,
          error: message
        })
      }
      
      if (message === 'El correo electrónico ya está registrado') {
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

  /**
   * Cambiar contraseña
   */
  static async updatePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          error: 'No autenticado'
        })
      }

      const body = updatePasswordSchema.parse(request.body)
      const result = await userService.updateUserPassword(request.user.userId, body)
      
      return reply.send({
        success: true,
        message: result.message
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar contraseña'
      
      if (message === 'Contraseña actual incorrecta') {
        return reply.status(400).send({
          success: false,
          error: message
        })
      }
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }

  /**
   * Eliminar usuario (solo admin)
   */
  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          error: 'No autenticado'
        })
      }

      const { id } = request.params
      const result = await userService.deleteUser(id, request.user.userId)
      
      return reply.send({
        success: true,
        message: result.message,
        data: result.user
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar usuario'
      
      if (message === 'Usuario no encontrado') {
        return reply.status(404).send({
          success: false,
          error: message
        })
      }
      
      if (message === 'No puedes eliminar tu propia cuenta' || message.includes('activo(s) asignado(s)')) {
        return reply.status(400).send({
          success: false,
          error: message
        })
      }
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }

  /**
   * Obtener usuarios responsables (para asignar activos)
   */
  static async getResponsibles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getResponsibleUsers()
      
      return reply.send({
        success: true,
        data: users
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener usuarios responsables'
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }

  /**
   * Obtener activos asignados a un usuario
   */
  static async getAssignedAssets(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const assets = await userService.getUserAssignedAssets(id)
      
      return reply.send({
        success: true,
        data: assets
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener activos asignados'
      
      return reply.status(500).send({
        success: false,
        error: message
      })
    }
  }
}
