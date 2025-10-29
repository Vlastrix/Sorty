import { FastifyInstance } from 'fastify';
import {
  scheduleAssetMaintenance,
  completeAssetMaintenance,
  startAssetMaintenance,
  cancelAssetMaintenance,
  getAllMaintenances,
  getUpcoming,
  getAssetMaintenances,
  getMaintenance,
} from '../controllers/maintenance.controller.js';
import { authenticateUser } from '../auth/middleware.js';
import { requireInventoryAccess } from '../auth/middleware.js';

export async function maintenanceRoutes(app: FastifyInstance) {
  // GET - Obtener todos los mantenimientos (cualquier usuario autenticado)
  app.get('/', { preHandler: authenticateUser }, getAllMaintenances as any);

  // GET - Obtener próximos mantenimientos
  app.get('/upcoming', { preHandler: authenticateUser }, getUpcoming as any);

  // GET - Obtener mantenimientos de un activo específico
  app.get('/asset/:assetId', { preHandler: authenticateUser }, getAssetMaintenances as any);

  // GET - Obtener un mantenimiento específico
  app.get('/:id', { preHandler: authenticateUser }, getMaintenance as any);

  // POST - Programar mantenimiento (todos los usuarios autenticados pueden solicitar)
  app.post('/', { preHandler: authenticateUser }, scheduleAssetMaintenance as any);

  // POST - Iniciar mantenimiento (solo ADMIN e INVENTORY_MANAGER)
  app.post('/:id/start', { preHandler: [authenticateUser, requireInventoryAccess] }, startAssetMaintenance as any);

  // POST - Completar mantenimiento (solo ADMIN e INVENTORY_MANAGER)
  app.post('/:id/complete', { preHandler: [authenticateUser, requireInventoryAccess] }, completeAssetMaintenance as any);

  // POST - Cancelar mantenimiento (solo ADMIN e INVENTORY_MANAGER)
  app.post('/:id/cancel', { preHandler: [authenticateUser, requireInventoryAccess] }, cancelAssetMaintenance as any);
}
