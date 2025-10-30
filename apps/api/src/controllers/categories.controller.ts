import { FastifyRequest, FastifyReply } from 'fastify'
import { CategoryService } from '../assets/categoryService.js'
import { createCategorySchema, updateCategorySchema } from '../assets/schemas.js'

export class CategoriesController {
  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await CategoryService.getAllCategories()
      return reply.send({ success: true, data: categories })
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message })
    }
  }

  static async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const category = await CategoryService.getCategoryById(id)
      return reply.send({ success: true, data: category })
    } catch (error: any) {
      return reply.status(404).send({ success: false, error: error.message })
    }
  }

  static async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createCategorySchema.parse(request.body)
      const category = await CategoryService.createCategory(validatedData)
      
      return reply.status(201).send({ success: true, data: category })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const validatedData = updateCategorySchema.parse(request.body)
      const category = await CategoryService.updateCategory(id, validatedData)
      
      return reply.send({ success: true, data: category })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      console.log('🗑️ Intentando eliminar categoría con ID:', id)
      
      const result = await CategoryService.deleteCategory(id)
      console.log('✅ Categoría eliminada exitosamente:', result)
      
      return reply.send({ success: true, data: result })
    } catch (error: any) {
      console.error('❌ Error al eliminar categoría:', error.message)
      return reply.status(400).send({ success: false, error: error.message })
    }
  }

  static async getDefaults(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const defaults = await CategoryService.getCategoryDefaults(id)
      return reply.send({ success: true, data: defaults })
    } catch (error: any) {
      return reply.status(404).send({ success: false, error: error.message })
    }
  }
}
