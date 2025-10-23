import { FastifyRequest, FastifyReply } from 'fastify'
import { AssignmentService } from '../assignments/assignmentService'
import { AssignmentStatus } from '@prisma/client'

export class AssignmentController {
  /**
   * POST /assignments - Asignar un activo
   */
  static async assignAsset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { assetId, assignedToId, location, reason, notes } = request.body as {
        assetId: string
        assignedToId: string
        location?: string
        reason?: string
        notes?: string
      }

      if (!assetId || !assignedToId) {
        return reply.status(400).send({
          success: false,
          error: 'assetId y assignedToId son requeridos'
        })
      }

      const assignment = await AssignmentService.assignAsset({
        assetId,
        assignedToId,
        assignedById: request.user!.userId,
        location,
        reason,
        notes
      })

      return reply.send({
        success: true,
        message: 'Activo asignado correctamente',
        data: assignment
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * POST /assignments/:assetId/return - Devolver un activo
   */
  static async returnAsset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { assetId } = request.params as { assetId: string }
      const { notes } = request.body as { notes?: string }

      const assignment = await AssignmentService.returnAsset({
        assetId,
        userId: request.user!.userId,
        notes
      })

      return reply.send({
        success: true,
        message: 'Activo devuelto correctamente',
        data: assignment
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * POST /assignments/:assetId/transfer - Transferir un activo
   */
  static async transferAsset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { assetId } = request.params as { assetId: string }
      const { newAssignedToId, building, office, reason, notes } = request.body as {
        newAssignedToId: string
        building?: string
        office?: string
        reason?: string
        notes?: string
      }

      if (!newAssignedToId) {
        return reply.status(400).send({
          success: false,
          error: 'newAssignedToId es requerido'
        })
      }

      const assignment = await AssignmentService.transferAsset({
        assetId,
        newAssignedToId,
        assignedById: request.user!.userId,
        building,
        office,
        reason,
        notes
      })

      return reply.send({
        success: true,
        message: 'Activo transferido correctamente',
        data: assignment
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * GET /assignments - Obtener historial de asignaciones con filtros opcionales
   */
  static async getAssignmentHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { assetId, userId, status } = request.query as {
        assetId?: string
        userId?: string
        status?: AssignmentStatus
      }

      const assignments = await AssignmentService.getAssignmentHistory({
        assetId,
        userId,
        status
      })

      return reply.send({
        success: true,
        data: assignments
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * GET /assignments/active - Obtener solo las asignaciones activas
   */
  static async getActiveAssignments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const assignments = await AssignmentService.getActiveAssignments()

      return reply.send({
        success: true,
        data: assignments
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * GET /assignments/:id - Obtener una asignación específica
   */
  static async getAssignmentById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      const assignment = await AssignmentService.getAssignmentById(id)

      return reply.send({
        success: true,
        data: assignment
      })
    } catch (error: any) {
      return reply.status(404).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * GET /assignments/asset/:assetId - Obtener historial de un activo específico
   */
  static async getAssetAssignmentHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { assetId } = request.params as { assetId: string }

      const assignments = await AssignmentService.getAssetAssignmentHistory(assetId)

      return reply.send({
        success: true,
        data: assignments
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * GET /assignments/user/:userId - Obtener historial de un usuario específico
   */
  static async getUserAssignmentHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string }

      const assignments = await AssignmentService.getUserAssignmentHistory(userId)

      return reply.send({
        success: true,
        data: assignments
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message
      })
    }
  }
}
