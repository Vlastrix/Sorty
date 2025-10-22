import { FastifyRequest, FastifyReply } from 'fastify'
import { AssetService } from '../assets/assetService.js'
import { UserRole } from '@prisma/client'
import { 
  createAssetSchema, 
  updateAssetSchema, 
  assetFiltersSchema,
  changeStatusSchema 
} from '../assets/schemas.js'

export class AssetsController {
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = assetFiltersSchema.parse(request.query)
      const userId = (request as any).user.userId
      const userRole = (request as any).user.role as UserRole
      
      const result = await AssetService.getAssets(filters, userId, userRole)
      return reply.send({ success: true, data: result })
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message })
    }
  }

  static async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const userId = (request as any).user.userId
      const userRole = (request as any).user.role as UserRole
      
      const asset = await AssetService.getAssetById(id, userId, userRole)
      return reply.send({ success: true, data: asset })
    } catch (error: any) {
      const status = error.message.includes('permiso') ? 403 : 404
      return reply.status(status).send({ success: false, error: error.message })
    }
  }

  static async getByCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { code } = request.params as { code: string }
      const asset = await AssetService.getAssetByCode(code)
      return reply.send({ success: true, data: asset })
    } catch (error: any) {
      return reply.status(404).send({ success: false, error: error.message })
    }
  }

  static async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createAssetSchema.parse(request.body)
      const userId = (request as any).user.userId
      const asset = await AssetService.createAsset(validatedData, userId)
      
      return reply.status(201).send({ success: true, data: asset })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const validatedData = updateAssetSchema.parse(request.body)
      
      console.log('🔄 PUT /assets/:id - Actualizando activo:', { id, data: validatedData })
      
      const asset = await AssetService.updateAsset(id, validatedData)
      
      console.log('✅ Activo actualizado correctamente:', asset.code)
      
      return reply.send({ success: true, data: asset })
    } catch (error: any) {
      console.error('❌ Error al actualizar activo:', error.message)
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async changeStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { status } = changeStatusSchema.parse(request.body)
      
      const asset = await AssetService.changeAssetStatus(id, status)
      return reply.send({ success: true, data: asset })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const result = await AssetService.deleteAsset(id)
      
      return reply.send({ success: true, data: result })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await AssetService.getAssetStats()
      return reply.send({ success: true, data: stats })
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message })
    }
  }

  // Asignar activo a un responsable
  static async assignAsset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { userId } = request.body as { userId: string }
      
      if (!userId) {
        return reply.status(400).send({ 
          success: false, 
          error: 'El ID del usuario es requerido' 
        })
      }

      const asset = await AssetService.assignAsset(id, userId)
      
      return reply.send({ 
        success: true, 
        message: 'Activo asignado correctamente',
        data: asset 
      })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  // Desasignar activo
  static async unassignAsset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      
      const asset = await AssetService.unassignAsset(id)
      
      return reply.send({ 
        success: true, 
        message: 'Activo desasignado correctamente',
        data: asset 
      })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }
}
