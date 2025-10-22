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
