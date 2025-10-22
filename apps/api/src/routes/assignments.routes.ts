import { FastifyInstance } from 'fastify'
import { AssignmentController } from '../controllers/assignments.controller'
import { authenticateUser, requireInventoryAccess } from '../auth/middleware'

export async function assignmentRoutes(server: FastifyInstance) {
  // Todas las rutas requieren autenticación
  server.addHook('onRequest', authenticateUser)

  // GET /assignments - Obtener historial de asignaciones (todos los usuarios autenticados)
  server.get('/', AssignmentController.getAssignmentHistory)

  // GET /assignments/active - Obtener asignaciones activas (todos los usuarios autenticados)
  server.get('/active', AssignmentController.getActiveAssignments)

  // GET /assignments/:id - Obtener una asignación específica
  server.get('/:id', AssignmentController.getAssignmentById)

  // GET /assignments/asset/:assetId - Historial de un activo específico
  server.get('/asset/:assetId', AssignmentController.getAssetAssignmentHistory)

  // GET /assignments/user/:userId - Historial de un usuario específico
  server.get('/user/:userId', AssignmentController.getUserAssignmentHistory)

  // Las siguientes rutas requieren permisos de inventario (ADMIN o INVENTORY_MANAGER)
  
  // POST /assignments - Asignar un activo
  server.post('/', {
    onRequest: [authenticateUser, requireInventoryAccess]
  }, AssignmentController.assignAsset)

  // POST /assignments/:assetId/return - Devolver un activo
  server.post('/:assetId/return', {
    onRequest: [authenticateUser, requireInventoryAccess]
  }, AssignmentController.returnAsset)

  // POST /assignments/:assetId/transfer - Transferir un activo
  server.post('/:assetId/transfer', {
    onRequest: [authenticateUser, requireInventoryAccess]
  }, AssignmentController.transferAsset)
}
