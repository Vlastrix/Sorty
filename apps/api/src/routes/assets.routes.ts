import { FastifyInstance } from 'fastify'
import { AssetsController } from '../controllers/assets.controller.js'
import { authenticateUser, requireInventoryAccess } from '../auth/middleware.js'

export async function assetsRoutes(app: FastifyInstance) {
  // Todas las rutas requieren autenticación
  app.addHook('preHandler', authenticateUser)

  // Rutas de lectura (todos los usuarios autenticados)
  app.get('/assets', AssetsController.getAll)
  app.get('/assets/code/:code', AssetsController.getByCode)
  app.get('/assets/:id', AssetsController.getById)
  app.get('/assets-stats', AssetsController.getStats)
  
  // Rutas de escritura (requieren admin o inventory manager)
  app.post('/assets', { preHandler: requireInventoryAccess }, AssetsController.create)
  app.put('/assets/:id', { preHandler: requireInventoryAccess }, AssetsController.update)
  app.patch('/assets/:id/status', { preHandler: requireInventoryAccess }, AssetsController.changeStatus)
  app.delete('/assets/:id', { preHandler: requireInventoryAccess }, AssetsController.delete)
  
  // Rutas de asignación (requieren admin o inventory manager)
  app.post('/assets/:id/assign', { preHandler: requireInventoryAccess }, AssetsController.assignAsset)
  app.post('/assets/:id/unassign', { preHandler: requireInventoryAccess }, AssetsController.unassignAsset)
}
