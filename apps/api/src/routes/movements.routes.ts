import { FastifyInstance } from 'fastify';
import {
  registerAssetEntry,
  registerAssetExit,
  getAllMovements,
  getAssetMovements,
  getMovement,
} from '../controllers/movements.controller.js';
import { authenticateUser } from '../auth/middleware.js';
import { requireInventoryAccess } from '../auth/middleware.js';

export async function movementRoutes(app: FastifyInstance) {
  // GET - Obtener todos los movimientos (cualquier usuario autenticado)
  app.get('/', { preHandler: authenticateUser }, getAllMovements as any);

  // GET - Obtener movimientos de un activo específico
  app.get('/asset/:assetId', { preHandler: authenticateUser }, getAssetMovements as any);

  // GET - Obtener un movimiento específico
  app.get('/:id', { preHandler: authenticateUser }, getMovement as any);

  // POST - Registrar entrada de activo (solo ADMIN e INVENTORY_MANAGER)
  app.post('/entry', { preHandler: [authenticateUser, requireInventoryAccess] }, registerAssetEntry as any);

  // POST - Registrar salida de activo (solo ADMIN e INVENTORY_MANAGER)
  app.post('/exit', { preHandler: [authenticateUser, requireInventoryAccess] }, registerAssetExit as any);
}
