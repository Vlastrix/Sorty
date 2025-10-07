import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken, extractTokenFromHeader } from './jwt.js'
import type { JWTPayload } from './jwt.js'

// Extender el tipo FastifyRequest para incluir user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
  }
}

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

export function requireRole(allowedRoles: string[]) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED' 
      })
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ 
        error: 'Acceso denegado: rol insuficiente',
        code: 'INSUFFICIENT_ROLE' 
      })
    }
  }
}