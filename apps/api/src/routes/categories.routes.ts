import { FastifyInstance } from 'fastify'
import { CategoriesController } from '../controllers/categories.controller.js'
import { authenticateUser } from '../auth/middleware.js'

export async function categoriesRoutes(app: FastifyInstance) {
  // Todas las rutas requieren autenticación
  app.addHook('preHandler', authenticateUser)

  // Rutas CRUD de categorías
  app.get('/categories', CategoriesController.getAll)
  app.get('/categories/:id', CategoriesController.getById)
  app.get('/categories/:id/defaults', CategoriesController.getDefaults)
  app.post('/categories', CategoriesController.create)
  app.put('/categories/:id', CategoriesController.update)
  app.delete('/categories/:id', CategoriesController.delete)
}
