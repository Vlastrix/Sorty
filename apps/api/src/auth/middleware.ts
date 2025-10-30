import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken, extractTokenFromHeader } from './jwt.js'
import type { JWTPayload } from './jwt.js'
import { UserRole, hasPermission, type UserRoleType } from './roles.js'

// Extender el tipo FastifyRequest para incluir user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
  }
}

/**
 * Middleware para autenticar usuario mediante JWT
 */
export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = extractTokenFromHeader(request.headers.authorization)
    
    if (!token) {
      return reply.status(401).send({ 
        error: 'Token de acceso requerido',
        code: 'MISSING_TOKEN' 
      })
    }

    const payload = verifyToken(token)
    request.user = payload
    
  } catch (error) {
    return reply.status(401).send({ 
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN' 
    })
  }
}

/**
 * Middleware para requerir roles específicos
 * @param allowedRoles Array de roles permitidos
 */
export function requireRole(allowedRoles: UserRoleType[]) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED' 
      })
    }

    if (!allowedRoles.includes(request.user.role as UserRoleType)) {
      return reply.status(403).send({ 
        error: 'Acceso denegado: permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: request.user.role
      })
    }
  }
}

/**
 * Middleware para verificar permisos específicos
 * @param resource Recurso a verificar (users, assets, categories, reports)
 * @param action Acción a verificar (create, read, update, delete, etc.)
 */
export function requirePermission(resource: string, action: string) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED' 
      })
    }

    const userRole = request.user.role as UserRoleType
    
    if (!hasPermission(userRole, resource as any, action)) {
      return reply.status(403).send({ 
        error: `Acceso denegado: no tienes permiso para ${action} ${resource}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        resource,
        action,
        userRole
      })
    }
  }
}

/**
 * Middleware que solo permite acceso a administradores
 */
export const requireAdmin = requireRole([UserRole.ADMIN])

/**
 * Middleware que permite acceso a administradores y encargados de inventario
 */
export const requireInventoryAccess = requireRole([UserRole.ADMIN, UserRole.INVENTORY_MANAGER])

/**
 * Middleware que permite acceso a todos los usuarios autenticados
 */
export const requireAuthenticated = authenticateUser
