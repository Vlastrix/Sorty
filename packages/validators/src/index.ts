import { z } from 'zod'

// ==================== Roles y Permisos ====================

export enum UserRole {
  ADMIN = 'ADMIN',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  ASSET_RESPONSIBLE = 'ASSET_RESPONSIBLE'
}

export const RoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.INVENTORY_MANAGER]: 'Encargado de Inventario',
  [UserRole.ASSET_RESPONSIBLE]: 'Responsable de Activo'
}

export const RoleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Gestión total del sistema, usuarios y activos',
  [UserRole.INVENTORY_MANAGER]: 'Alta, baja y actualización de activos. Gestión del inventario',
  [UserRole.ASSET_RESPONSIBLE]: 'Visualización de activos asignados y solicitudes de mantenimiento'
}

// Permisos por rol
export interface RolePermissions {
  users: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    manageRoles: boolean
  }
  assets: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    assign: boolean
    viewAll: boolean
  }
  categories: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
  reports: {
    generate: boolean
    viewAll: boolean
  }
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    users: { create: true, read: true, update: true, delete: true, manageRoles: true },
    assets: { create: true, read: true, update: true, delete: true, assign: true, viewAll: true },
    categories: { create: true, read: true, update: true, delete: true },
    reports: { generate: true, viewAll: true }
  },
  [UserRole.INVENTORY_MANAGER]: {
    users: { create: false, read: true, update: false, delete: false, manageRoles: false },
    assets: { create: true, read: true, update: true, delete: true, assign: true, viewAll: true },
    categories: { create: true, read: true, update: true, delete: false },
    reports: { generate: true, viewAll: true }
  },
  [UserRole.ASSET_RESPONSIBLE]: {
    users: { create: false, read: false, update: false, delete: false, manageRoles: false },
    assets: { create: false, read: true, update: false, delete: false, assign: false, viewAll: false },
    categories: { create: false, read: true, update: false, delete: false },
    reports: { generate: false, viewAll: false }
  }
}

// Funciones de utilidad para permisos
export function hasPermission(
  role: UserRole,
  resource: keyof RolePermissions,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  
  const resourcePermissions = permissions[resource] as Record<string, boolean>
  return resourcePermissions?.[action] ?? false
}

export function canManageAssets(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER
}

export function canManageUsers(role: UserRole): boolean {
  return role === UserRole.ADMIN
}

export function canViewAllAssets(role: UserRole): boolean {
  return hasPermission(role, 'assets', 'viewAll')
}

// ==================== Enums de Estado ====================

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  TRANSFERRED = 'TRANSFERRED'
}

export const AssignmentStatusLabels: Record<AssignmentStatus, string> = {
  [AssignmentStatus.ACTIVE]: 'Activa',
  [AssignmentStatus.RETURNED]: 'Devuelta',
  [AssignmentStatus.TRANSFERRED]: 'Transferida'
}

// ==================== Validaciones ====================

export const AssetCreate = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional()
})

// ==================== Tipos ====================

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: UserRole
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

export interface AssetAssignment {
  id: string
  assetId: string
  assignedToId: string
  assignedById: string
  location?: string
  reason?: string
  notes?: string
  assignedAt: string
  returnedAt?: string
  status: AssignmentStatus
  asset?: {
    id: string
    code: string
    name: string
    category?: {
      id: string
      name: string
    }
  }
  assignedTo?: {
    id: string
    email: string
    name?: string
    role: UserRole
  }
  assignedBy?: {
    id: string
    email: string
    name?: string
    role: UserRole
  }
}

// ==================== Movimientos de Inventario ====================

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA'
}

export enum MovementSubtype {
  // Entradas
  COMPRA = 'COMPRA',
  DONACION_IN = 'DONACION_IN',
  TRANSFERENCIA_IN = 'TRANSFERENCIA_IN',
  // Salidas
  BAJA = 'BAJA',
  VENTA = 'VENTA',
  DONACION_OUT = 'DONACION_OUT',
  TRANSFERENCIA_OUT = 'TRANSFERENCIA_OUT'
}

export const MovementTypeLabels: Record<MovementType, string> = {
  [MovementType.ENTRADA]: 'Entrada',
  [MovementType.SALIDA]: 'Salida'
}

export const MovementSubtypeLabels: Record<MovementSubtype, string> = {
  [MovementSubtype.COMPRA]: 'Compra',
  [MovementSubtype.DONACION_IN]: 'Donación Recibida',
  [MovementSubtype.TRANSFERENCIA_IN]: 'Transferencia Recibida',
  [MovementSubtype.BAJA]: 'Baja',
  [MovementSubtype.VENTA]: 'Venta',
  [MovementSubtype.DONACION_OUT]: 'Donación Entregada',
  [MovementSubtype.TRANSFERENCIA_OUT]: 'Transferencia Enviada'
}

export interface AssetMovement {
  id: string
  assetId: string
  type: MovementType
  movementType: MovementSubtype
  description: string
  cost?: number
  quantity: number
  userId: string
  date: string
  notes?: string
  createdAt: string
  asset?: {
    id: string
    code: string
    name: string
    category?: {
      id: string
      name: string
    }
  }
  user?: {
    id: string
    email: string
    name?: string
  }
}

// ==================== Mantenimientos ====================

export enum MaintenanceType {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export const MaintenanceTypeLabels: Record<MaintenanceType, string> = {
  [MaintenanceType.PREVENTIVO]: 'Preventivo',
  [MaintenanceType.CORRECTIVO]: 'Correctivo'
}

export const MaintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.SCHEDULED]: 'Programado',
  [MaintenanceStatus.IN_PROGRESS]: 'En Progreso',
  [MaintenanceStatus.COMPLETED]: 'Completado',
  [MaintenanceStatus.CANCELLED]: 'Cancelado'
}

export interface Maintenance {
  id: string
  assetId: string
  type: MaintenanceType
  scheduledDate: string
  completedDate?: string
  cost?: number
  description: string
  performedBy?: string
  status: MaintenanceStatus
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
  asset?: {
    id: string
    code: string
    name: string
    category?: {
      id: string
      name: string
    }
  }
  user?: {
    id: string
    email: string
    name?: string
  }
}

// ==================== Incidencias ====================

export enum IncidentType {
  DANO = 'DANO',
  PERDIDA = 'PERDIDA',
  ROBO = 'ROBO',
  MAL_FUNCIONAMIENTO = 'MAL_FUNCIONAMIENTO'
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export const IncidentTypeLabels: Record<IncidentType, string> = {
  [IncidentType.DANO]: 'Daño',
  [IncidentType.PERDIDA]: 'Pérdida',
  [IncidentType.ROBO]: 'Robo',
  [IncidentType.MAL_FUNCIONAMIENTO]: 'Mal Funcionamiento'
}

export const IncidentStatusLabels: Record<IncidentStatus, string> = {
  [IncidentStatus.REPORTED]: 'Reportado',
  [IncidentStatus.INVESTIGATING]: 'En Investigación',
  [IncidentStatus.RESOLVED]: 'Resuelto',
  [IncidentStatus.CLOSED]: 'Cerrado'
}

export interface Incident {
  id: string
  assetId: string
  type: IncidentType
  reportedDate: string
  resolvedDate?: string
  description: string
  reportedById: string
  status: IncidentStatus
  resolution?: string
  cost?: number
  notes?: string
  createdAt: string
  updatedAt: string
  asset?: {
    id: string
    code: string
    name: string
    category?: {
      id: string
      name: string
    }
  }
  reportedBy?: {
    id: string
    email: string
    name?: string
  }
}
