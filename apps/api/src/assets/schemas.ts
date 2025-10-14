import { z } from 'zod'

// Enum para el estado de activos
export const AssetStatus = z.enum(['AVAILABLE', 'IN_USE', 'IN_REPAIR', 'DECOMMISSIONED'])

// Schema para crear categoría
export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().optional(),
  parentId: z.string().cuid('ID de categoría padre inválido').optional().nullable()
})

// Schema para crear activo
export const createAssetSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50, 'El código es muy largo'),
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo'),
  description: z.string().optional(),
  
  // Información técnica
  brand: z.string().max(100, 'La marca es muy larga').optional(),
  model: z.string().max(100, 'El modelo es muy largo').optional(),
  serialNumber: z.string().max(100, 'El número de serie es muy largo').optional(),
  
  // Datos contables
  acquisitionCost: z.number().positive('El costo debe ser positivo'),
  purchaseDate: z.string().transform((str) => new Date(str)),
  supplier: z.string().max(200, 'El proveedor es muy largo').optional(),
  usefulLife: z.number().int().positive('La vida útil debe ser positiva').max(100, 'La vida útil es muy alta'),
  residualValue: z.number().min(0, 'El valor residual no puede ser negativo').default(0),
  
  // Ubicación
  building: z.string().max(100, 'El edificio es muy largo').optional(),
  office: z.string().max(100, 'La oficina es muy larga').optional(),
  laboratory: z.string().max(100, 'El laboratorio es muy largo').optional(),
  location: z.string().max(200, 'La ubicación es muy larga').optional(),
  
  // Estado y categoría
  status: AssetStatus.default('AVAILABLE'),
  categoryId: z.string().cuid('ID de categoría inválido')
})

// Schema para actualizar activo (todos los campos opcionales excepto código)
// Nota: Mantenemos la transformación de fecha para campos opcionales
export const updateAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo').optional(),
  description: z.string().optional(),
  
  // Información técnica
  brand: z.string().max(100, 'La marca es muy larga').optional(),
  model: z.string().max(100, 'El modelo es muy largo').optional(),
  serialNumber: z.string().max(100, 'El número de serie es muy largo').optional(),
  
  // Datos contables
  acquisitionCost: z.number().positive('El costo debe ser positivo').optional(),
  purchaseDate: z.string().transform((str) => new Date(str)).optional(),
  supplier: z.string().max(200, 'El proveedor es muy largo').optional(),
  usefulLife: z.number().int().positive('La vida útil debe ser positiva').max(100, 'La vida útil es muy alta').optional(),
  residualValue: z.number().min(0, 'El valor residual no puede ser negativo').optional(),
  
  // Ubicación
  building: z.string().max(100, 'El edificio es muy largo').optional(),
  office: z.string().max(100, 'La oficina es muy larga').optional(),
  laboratory: z.string().max(100, 'El laboratorio es muy largo').optional(),
  location: z.string().max(200, 'La ubicación es muy larga').optional(),
  
  // Estado y categoría
  status: AssetStatus.optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional()
})

// Schema para actualizar categoría
export const updateCategorySchema = createCategorySchema.partial()

// Schema para filtros de búsqueda
export const assetFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: AssetStatus.optional(),
  building: z.string().optional(),
  office: z.string().optional(),
  laboratory: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1).pipe(z.number().int().positive().default(1)),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10).pipe(z.number().int().positive().max(1000).default(10))
})

// Schema para cambio de estado
export const changeStatusSchema = z.object({
  status: AssetStatus
})

// Tipos TypeScript
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type AssetFilters = z.infer<typeof assetFiltersSchema>
export type AssetStatusType = z.infer<typeof AssetStatus>
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>