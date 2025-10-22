/**
 * Definición de roles y permisos del sistema
 */

export const UserRole = {
  ADMIN: 'ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  ASSET_RESPONSIBLE: 'ASSET_RESPONSIBLE'
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

/**
 * Permisos por rol en el sistema
 */
export const RolePermissions = {
  [UserRole.ADMIN]: {
    // Gestión total
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
      manageRoles: true
    },
    assets: {
      create: true,
      read: true,
      update: true,
      delete: true,
      assign: true,
      viewAll: true
    },
    categories: {
      create: true,
      read: true,
      update: true,
      delete: true
    },
    reports: {
      generate: true,
      viewAll: true
    }
  },
  
  [UserRole.INVENTORY_MANAGER]: {
    // Alta, baja, actualización de activos
    users: {
      create: false,
      read: true,  // Puede ver usuarios para asignar activos
      update: false,
      delete: false,
      manageRoles: false
    },
    assets: {
      create: true,
      read: true,
      update: true,
      delete: true,  // Puede dar de baja activos
      assign: true,  // Puede asignar activos a responsables
      viewAll: true
    },
    categories: {
      create: true,
      read: true,
      update: true,
      delete: false
    },
    reports: {
      generate: true,
      viewAll: true
    }
  },
  
  [UserRole.ASSET_RESPONSIBLE]: {
    // Visualización de activos asignados, solicitudes de mantenimiento
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      manageRoles: false
    },
    assets: {
      create: false,
      read: true,  // Solo sus activos asignados
      update: false,  // Puede reportar problemas pero no editar
      delete: false,
      assign: false,
      viewAll: false  // Solo ve sus activos
    },
    categories: {
      create: false,
      read: true,
      update: false,
      delete: false
    },
    reports: {
      generate: false,
      viewAll: false  // Solo sus reportes
    }
  }
} as const

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(
  role: UserRoleType,
  resource: keyof typeof RolePermissions[typeof UserRole.ADMIN],
  action: string
): boolean {
  const permissions = RolePermissions[role]
  if (!permissions) return false
  
  const resourcePermissions = permissions[resource] as Record<string, boolean>
  return resourcePermissions?.[action] ?? false
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: UserRoleType) {
  return RolePermissions[role] || {}
}

/**
 * Verifica si un rol puede gestionar activos
 */
export function canManageAssets(role: UserRoleType): boolean {
  return role === UserRole.ADMIN || role === UserRole.INVENTORY_MANAGER
}

/**
 * Verifica si un rol puede gestionar usuarios
 */
export function canManageUsers(role: UserRoleType): boolean {
  return role === UserRole.ADMIN
}

/**
 * Verifica si un rol puede ver todos los activos
 */
export function canViewAllAssets(role: UserRoleType): boolean {
  return hasPermission(role, 'assets', 'viewAll')
}

/**
 * Labels amigables para los roles
 */
export const RoleLabels: Record<UserRoleType, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.INVENTORY_MANAGER]: 'Encargado de Inventario',
  [UserRole.ASSET_RESPONSIBLE]: 'Responsable de Activo'
}

/**
 * Descripciones de los roles
 */
export const RoleDescriptions: Record<UserRoleType, string> = {
  [UserRole.ADMIN]: 'Gestión total del sistema, usuarios y activos',
  [UserRole.INVENTORY_MANAGER]: 'Alta, baja y actualización de activos. Gestión del inventario',
  [UserRole.ASSET_RESPONSIBLE]: 'Visualización de activos asignados y solicitudes de mantenimiento'
}
