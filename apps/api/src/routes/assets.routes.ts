import { FastifyInstance } from 'fastify'
import { AssetsController } from '../controllers/assets.controller.js'
import { authenticateUser } from '../auth/middleware.js'

export async function assetsRoutes(app: FastifyInstance) {
  // Todas las rutas requieren autenticación
  app.addHook('preHandler', authenticateUser)

  // Rutas de activos
  app.get('/assets', AssetsController.getAll)
  app.post('/assets', AssetsController.create)
  app.get('/assets/code/:code', AssetsController.getByCode)
  app.get('/assets/:id', AssetsController.getById)
  app.put('/assets/:id', AssetsController.update)
  app.patch('/assets/:id/status', AssetsController.changeStatus)
  app.delete('/assets/:id', AssetsController.delete)
  
  // Estadísticas
  app.get('/assets-stats', AssetsController.getStats)
}
