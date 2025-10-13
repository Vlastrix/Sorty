import { PrismaClient, Prisma } from '@prisma/client'
import type { CreateCategoryInput, UpdateCategoryInput } from './schemas'

const prisma = new PrismaClient()

export class CategoryService {
  // Crear categoría
  static async createCategory(data: CreateCategoryInput) {
    try {
      const category = await prisma.category.create({
        data,
        include: {
          _count: {
            select: { assets: true }
          }
        }
      })
      
      return category
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Ya existe una categoría con ese nombre')
        }
      }
      throw error
    }
  }

  // Obtener todas las categorías
  static async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  // Obtener solo categorías principales (sin padre) - Implementaremos cuando el cliente esté actualizado
  static async getMainCategories() {
    // Temporalmente devolvemos todas las categorías
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  // Obtener categoría por ID
  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true }
        },
        assets: {
          select: {
            id: true,
            code: true,
            name: true
          },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!category) {
      throw new Error('Categoría no encontrada')
    }

    return category
  }

  // Actualizar categoría
  static async updateCategory(id: string, data: UpdateCategoryInput) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data,
        include: {
          _count: {
            select: { assets: true }
          }
        }
      })

      return category
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Ya existe una categoría con ese nombre')
        }
        if (error.code === 'P2025') {
          throw new Error('Categoría no encontrada')
        }
      }
      throw error
    }
  }

  // Eliminar categoría
  static async deleteCategory(id: string) {
    try {
      // Verificar si la categoría existe y obtener información completa
      const category = await prisma.category.findUnique({
        where: { id },
        include: { 
          _count: { 
            select: { 
              assets: true,
              subcategories: true 
            } 
          },
          subcategories: {
            include: {
              _count: {
                select: { assets: true }
              }
            }
          }
        }
      })

      if (!category) {
        throw new Error('Categoría no encontrada')
      }

      // Verificar si tiene activos directos
      if (category._count.assets > 0) {
        throw new Error('No se puede eliminar una categoría que tiene activos asociados')
      }

      // Verificar si tiene subcategorías
      if (category._count.subcategories > 0) {
        // Verificar si alguna subcategoría tiene activos
        const subcategoriesWithAssets = category.subcategories.filter(sub => sub._count.assets > 0)
        
        if (subcategoriesWithAssets.length > 0) {
          const subcategoryNames = subcategoriesWithAssets.map(sub => sub.name).join(', ')
          throw new Error(`No se puede eliminar la categoría porque tiene subcategorías con activos: ${subcategoryNames}`)
        }

        // Si no hay activos en subcategorías, eliminar subcategorías primero
        await prisma.category.deleteMany({
          where: { parentId: id }
        })
      }

      // Eliminar la categoría principal
      await prisma.category.delete({
        where: { id }
      })

      return { message: 'Categoría eliminada correctamente' }
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Categoría no encontrada')
        }
        if (error.code === 'P2003') {
          throw new Error('No se puede eliminar la categoría debido a restricciones de relación')
        }
      }
      throw error
    }
  }

  // Obtener categorías con estadísticas
  static async getCategoriesWithStats() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return categories
  }
}