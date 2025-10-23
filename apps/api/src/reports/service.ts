import { PrismaClient, AssetStatus } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Calcula la edad del activo en días desde su compra
 */
function calculateAssetAge(purchaseDate: Date | string | null): number {
  if (!purchaseDate) return 0
  const now = new Date()
  const purchase = new Date(purchaseDate)
  const diffTime = Math.abs(now.getTime() - purchase.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula los meses restantes de vida útil
 */
function calculateRemainingLife(purchaseDate: Date | string | null, usefulLife: number | null): number | undefined {
  if (!purchaseDate || !usefulLife) return undefined
  
  const ageInDays = calculateAssetAge(purchaseDate)
  const ageInMonths = ageInDays / 30
  const remainingMonths = (usefulLife * 12) - ageInMonths
  
  return Math.max(0, Math.round(remainingMonths))
}

/**
 * Calcula el porcentaje de depreciación
 */
function calculateDepreciation(
  purchaseDate: Date | string | null,
  usefulLife: number | null,
  acquisitionCost: number | null,
  residualValue: number | null
): number | undefined {
  if (!purchaseDate || !usefulLife || !acquisitionCost) return undefined
  
  const ageInDays = calculateAssetAge(purchaseDate)
  const ageInMonths = ageInDays / 30
  const totalLifeMonths = usefulLife * 12
  
  if (ageInMonths >= totalLifeMonths) return 100
  
  const depreciableValue = acquisitionCost - (residualValue || 0)
  const depreciationPerMonth = depreciableValue / totalLifeMonths
  const totalDepreciation = depreciationPerMonth * ageInMonths
  
  return Math.min(100, (totalDepreciation / acquisitionCost) * 100)
}

/**
 * Enriquece un activo con datos calculados
 */
function enrichAsset(asset: any): any {
  const cost = asset.acquisitionCost ? parseFloat(asset.acquisitionCost.toString()) : 0
  const residual = asset.residualValue ? parseFloat(asset.residualValue.toString()) : 0
  
  return {
    ...asset,
    acquisitionCost: cost,
    residualValue: residual,
    daysInUse: calculateAssetAge(asset.purchaseDate),
    remainingLife: calculateRemainingLife(asset.purchaseDate, asset.usefulLife),
    depreciationPercent: calculateDepreciation(
      asset.purchaseDate,
      asset.usefulLife,
      cost,
      residual
    )
  }
}

/**
 * Genera reporte por categoría
 */
export async function generateReportByCategory(filters: any, userId: string) {
  const { categoryId, includeSubcategories = true } = filters

  let categoryIds: string[] = []
  
  if (categoryId) {
    categoryIds.push(categoryId)
    
    if (includeSubcategories) {
      const subcategories = await prisma.category.findMany({
        where: { parentId: categoryId }
      })
      categoryIds.push(...subcategories.map(c => c.id))
    }
  }

  const whereClause: any = {}
  if (categoryIds.length > 0) {
    whereClause.categoryId = { in: categoryIds }
  }

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      category: { include: { parent: true } },
      createdBy: true
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  })

  const enrichedAssets = assets.map(enrichAsset)

  const groupedByCategory = new Map<string, any[]>()
  enrichedAssets.forEach(asset => {
    const categoryName = asset.category?.name || 'Sin categoría'
    if (!groupedByCategory.has(categoryName)) {
      groupedByCategory.set(categoryName, [])
    }
    groupedByCategory.get(categoryName)!.push(asset)
  })

  const groupedData = Array.from(groupedByCategory.entries()).map(([label, assets]) => ({
    label,
    count: assets.length,
    totalValue: assets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
    assets
  }))

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return {
    reportType: 'BY_CATEGORY',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0,
      byCategory: Object.fromEntries(
        Array.from(groupedByCategory.entries()).map(([name, assets]) => [name, assets.length])
      )
    },
    assets: enrichedAssets,
    groupedData
  }
}

/**
 * Genera reporte por ubicación
 */
export async function generateReportByLocation(filters: any, userId: string) {
  const { location } = filters

  const whereClause: any = {}
  if (location) {
    whereClause.OR = [
      { building: { contains: location, mode: 'insensitive' } },
      { office: { contains: location, mode: 'insensitive' } },
      { currentLocation: { contains: location, mode: 'insensitive' } }
    ]
  }

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      category: { include: { parent: true } },
      createdBy: true
    },
    orderBy: [
      { building: 'asc' },
      { office: 'asc' }
    ]
  })

  const enrichedAssets = assets.map(enrichAsset)

  const groupedByLocation = new Map<string, any[]>()
  enrichedAssets.forEach(asset => {
    const location = `${asset.building || 'Sin edificio'} - ${asset.office || 'Sin oficina'}`
    if (!groupedByLocation.has(location)) {
      groupedByLocation.set(location, [])
    }
    groupedByLocation.get(location)!.push(asset)
  })

  const groupedData = Array.from(groupedByLocation.entries()).map(([label, assets]) => ({
    label,
    count: assets.length,
    totalValue: assets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
    assets
  }))

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return {
    reportType: 'BY_LOCATION',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0,
      byLocation: Object.fromEntries(
        Array.from(groupedByLocation.entries()).map(([name, assets]) => [name, assets.length])
      )
    },
    assets: enrichedAssets,
    groupedData
  }
}

/**
 * Genera reporte por estado
 */
export async function generateReportByStatus(filters: any, userId: string) {
  const { status } = filters

  const whereClause: any = {}
  if (status) {
    whereClause.status = status
  }

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      category: { include: { parent: true } },
      createdBy: true
    },
    orderBy: [
      { status: 'asc' },
      { name: 'asc' }
    ]
  })

  const enrichedAssets = assets.map(enrichAsset)

  const groupedByStatus = new Map<string, any[]>()
  enrichedAssets.forEach(asset => {
    const statusLabel = asset.status
    if (!groupedByStatus.has(statusLabel)) {
      groupedByStatus.set(statusLabel, [])
    }
    groupedByStatus.get(statusLabel)!.push(asset)
  })

  const groupedData = Array.from(groupedByStatus.entries()).map(([label, assets]) => ({
    label,
    count: assets.length,
    totalValue: assets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
    assets
  }))

  const user = await prisma.user.findUnique({ where: { id: userId } })

  const statusCounts = Object.fromEntries(
    Array.from(groupedByStatus.entries()).map(([status, assets]) => [status, assets.length])
  )

  return {
    reportType: 'BY_STATUS',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0,
      byStatus: statusCounts
    },
    assets: enrichedAssets,
    groupedData
  }
}

/**
 * Genera reporte por responsable
 */
export async function generateReportByResponsible(filters: any, userId: string) {
  const { responsibleId } = filters

  const whereClause: any = {}
  if (responsibleId) {
    whereClause.assignedToId = responsibleId
  } else {
    whereClause.assignedToId = { not: null }
  }

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      category: { include: { parent: true } },
      createdBy: true
    },
    orderBy: { name: 'asc' }
  })

  const enrichedAssets = assets.map(enrichAsset)

  const groupedByResponsible = new Map<string, any[]>()
  for (const asset of enrichedAssets) {
    if (asset.assignedToId) {
      const responsible = await prisma.user.findUnique({
        where: { id: asset.assignedToId }
      })
      const responsibleName = responsible?.name || responsible?.email || 'Sin asignar'
      if (!groupedByResponsible.has(responsibleName)) {
        groupedByResponsible.set(responsibleName, [])
      }
      groupedByResponsible.get(responsibleName)!.push(asset)
    }
  }

  const groupedData = Array.from(groupedByResponsible.entries()).map(([label, assets]) => ({
    label,
    count: assets.length,
    totalValue: assets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
    assets
  }))

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return {
    reportType: 'BY_RESPONSIBLE',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0
    },
    assets: enrichedAssets,
    groupedData
  }
}

/**
 * Genera reporte de activos próximos a vencer su vida útil
 */
export async function generateReportUsefulLifeExpiring(filters: any, userId: string) {
  const { monthsToExpire = 12 } = filters

  const assets = await prisma.asset.findMany({
    where: {
      AND: [
        { usefulLife: { not: undefined } },
        { purchaseDate: { not: undefined } }
      ]
    },
    include: {
      category: { include: { parent: true } },
      createdBy: true
    }
  })

  const enrichedAssets = assets
    .map(enrichAsset)
    .filter(asset => {
      const remaining = asset.remainingLife
      return remaining !== undefined && remaining <= monthsToExpire && remaining >= 0
    })
    .sort((a, b) => (a.remainingLife || 0) - (b.remainingLife || 0))

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return {
    reportType: 'USEFUL_LIFE_EXPIRING',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0
    },
    assets: enrichedAssets
  }
}

/**
 * Genera reporte de mantenimiento pendiente
 */
export async function generateReportMaintenancePending(filters: any, userId: string) {
  const maintenances = await prisma.maintenance.findMany({
    where: {
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
    },
    include: {
      asset: {
        include: {
          category: { include: { parent: true } },
          createdBy: true
        }
      }
    },
    orderBy: { scheduledDate: 'asc' }
  })

  const assetsWithMaintenance = maintenances.map((m: any) => m.asset)
  const enrichedAssets = assetsWithMaintenance.map(enrichAsset)

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return {
    reportType: 'MAINTENANCE_PENDING',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0
    },
    assets: enrichedAssets
  }
}

/**
 * Genera reporte de activos en reparación
 */
export async function generateReportInRepair(filters: any, userId: string) {
  const assets = await prisma.asset.findMany({
    where: { status: AssetStatus.IN_REPAIR },
    include: {
      category: { include: { parent: true } },
      createdBy: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  const enrichedAssets = assets.map(enrichAsset)

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return {
    reportType: 'IN_REPAIR',
    filters,
    generatedAt: new Date().toISOString(),
    generatedBy: {
      id: user!.id,
      email: user!.email,
      name: user!.name
    },
    summary: {
      totalAssets: enrichedAssets.length,
      totalValue: enrichedAssets.reduce((sum: number, a: any) => sum + (a.acquisitionCost || 0), 0),
      averageAge: enrichedAssets.reduce((sum: number, a: any) => sum + (a.daysInUse || 0), 0) / enrichedAssets.length || 0
    },
    assets: enrichedAssets
  }
}

/**
 * Genera reporte según el tipo especificado
 */
export async function generateReport(filters: any, userId: string) {
  switch (filters.reportType) {
    case 'BY_CATEGORY':
      return generateReportByCategory(filters, userId)
    case 'BY_LOCATION':
      return generateReportByLocation(filters, userId)
    case 'BY_STATUS':
      return generateReportByStatus(filters, userId)
    case 'BY_RESPONSIBLE':
      return generateReportByResponsible(filters, userId)
    case 'USEFUL_LIFE_EXPIRING':
      return generateReportUsefulLifeExpiring(filters, userId)
    case 'MAINTENANCE_PENDING':
      return generateReportMaintenancePending(filters, userId)
    case 'IN_REPAIR':
      return generateReportInRepair(filters, userId)
    default:
      throw new Error(`Tipo de reporte no soportado: ${filters.reportType}`)
  }
}
