// Tipos para el catálogo de activos

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  
  // Jerarquía de categorías
  parentId?: string | null
  parent?: Category | null
  subcategories?: Category[]
  
  _count?: {
    assets: number
    subcategories: number
  }
}

export interface Asset {
  id: string
  code: string
  name: string
  description?: string
  
  // Información técnica
  brand?: string
  model?: string
  serialNumber?: string
  
  // Datos contables
  acquisitionCost: number
  purchaseDate: string
  supplier?: string
  usefulLife: number
  residualValue: number
  
  // Ubicación física
  building?: string
  office?: string
  laboratory?: string
  location?: string
  
  // Estado del activo
  status: AssetStatus
  
  // Relaciones
  categoryId: string
  category: Category
  
  // Auditoría
  createdAt: string
  updatedAt: string
  createdById: string
}

export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'IN_REPAIR' | 'DECOMMISSIONED'

export const AssetStatusLabels: Record<AssetStatus, string> = {
  AVAILABLE: 'Disponible',
  IN_USE: 'En uso',
  IN_REPAIR: 'En reparación',
  DECOMMISSIONED: 'Dado de baja'
}

export const AssetStatusColors: Record<AssetStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  IN_USE: 'bg-blue-100 text-blue-800',
  IN_REPAIR: 'bg-yellow-100 text-yellow-800',
  DECOMMISSIONED: 'bg-red-100 text-red-800'
}

export interface CreateCategoryInput {
  name: string
  description?: string
  parentId?: string | null // Para crear subcategorías
}

export interface CreateAssetInput {
  code: string
  name: string
  description?: string
  brand?: string
  model?: string
  serialNumber?: string
  acquisitionCost: number
  purchaseDate: string
  supplier?: string
  usefulLife: number
  residualValue?: number
  building?: string
  office?: string
  laboratory?: string
  location?: string
  status?: AssetStatus
  categoryId: string
}

export interface AssetFilters {
  search?: string
  categoryId?: string
  status?: AssetStatus
  building?: string
  office?: string
  laboratory?: string
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface AssetsResponse {
  assets: Asset[]
  pagination: PaginationInfo
}

export interface AssetStats {
  total: number
  recentAssets: Asset[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}