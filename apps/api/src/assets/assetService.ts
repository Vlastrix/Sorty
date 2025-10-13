import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AssetService {
  // Crear activo
  static async createAsset(data: any, createdById: string) {
    try {
      const asset = await prisma.asset.create({
        data: {
          ...data,
          createdById
        },
        include: {
          category: true
        }
      })

      return asset
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe un activo con ese código')
      }
      if (error.code === 'P2003') {
        throw new Error('Categoría no encontrada')
      }
      throw error
    }
  }

  // Obtener activos con filtros y paginación
  static async getAssets(filters: any) {
    const { search, categoryId, building, office, laboratory, page = 1, limit = 10 } = filters
    const skip = (page - 1) * limit

    // Construir condiciones de filtro
    const where: any = {}

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (building) {
      where.building = { contains: building, mode: 'insensitive' }
    }

    if (office) {
      where.office = { contains: office, mode: 'insensitive' }
    }

    if (laboratory) {
      where.laboratory = { contains: laboratory, mode: 'insensitive' }
    }

    // Ejecutar consulta con paginación
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.asset.count({ where })
    ])

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Obtener activo por ID
  static async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!asset) {
      throw new Error('Activo no encontrado')
    }

    return asset
  }

  // Obtener activo por código
  static async getAssetByCode(code: string) {
    const asset = await prisma.asset.findUnique({
      where: { code },
      include: {
        category: true
      }
    })

    if (!asset) {
      throw new Error('Activo no encontrado')
    }

    return asset
  }

  // Actualizar activo
  static async updateAsset(id: string, data: any) {
    try {
      const asset = await prisma.asset.update({
        where: { id },
        data,
        include: {
          category: true
        }
      })

      return asset
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe un activo con ese código')
      }
      if (error.code === 'P2025') {
        throw new Error('Activo no encontrado')
      }
      if (error.code === 'P2003') {
        throw new Error('Categoría no encontrada')
      }
      throw error
    }
  }

  // Eliminar activo
  static async deleteAsset(id: string) {
    try {
      await prisma.asset.delete({
        where: { id }
      })

      return { message: 'Activo eliminado correctamente' }
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Activo no encontrado')
      }
      throw error
    }
  }

  // Cambiar estado del activo
  static async changeAssetStatus(id: string, status: string) {
    try {
      const asset = await prisma.asset.update({
        where: { id },
        data: { status: status as any },
        include: {
          category: true
        }
      })

      return asset
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Activo no encontrado')
      }
      throw error
    }
  }

  // Estadísticas básicas de activos
  static async getAssetStats() {
    const [total, recentAssets] = await Promise.all([
      // Total de activos
      prisma.asset.count(),
      
      // Activos recientes
      prisma.asset.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true
        }
      })
    ])

    return {
      total,
      recentAssets
    }
  }
}