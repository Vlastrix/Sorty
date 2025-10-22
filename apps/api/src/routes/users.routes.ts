import { FastifyInstance } from 'fastify'
import { UserController } from '../controllers/users.controller.js'
import { authenticateUser, requireAdmin, requireInventoryAccess } from '../auth/middleware.js'

export async function userRoutes(app: FastifyInstance) {
  // Todas las rutas requieren autenticación
  app.addHook('preHandler', authenticateUser)

  // Obtener usuarios responsables (para asignar activos) - accesible por admin e inventory manager
  app.get(
    '/responsibles', 
    { preHandler: requireInventoryAccess },
    UserController.getResponsibles
  )

  // Cambiar mi contraseña (cualquier usuario autenticado)
  app.put('/me/password', UserController.updatePassword)

  // Obtener activos asignados a un usuario
  app.get('/:id/assets', UserController.getAssignedAssets)

  // CRUD de usuarios (solo admin)
  app.get('/', { preHandler: requireAdmin }, UserController.getAll)
  app.get('/:id', { preHandler: requireAdmin }, UserController.getById)
  app.post('/', { preHandler: requireAdmin }, UserController.create)
  app.put('/:id', { preHandler: requireAdmin }, UserController.update)
  app.delete('/:id', { preHandler: requireAdmin }, UserController.delete)
}
