import { FastifyInstance } from 'fastify';
import {
  reportAssetIncident,
  resolveAssetIncident,
  investigateAssetIncident,
  closeAssetIncident,
  getAllIncidents,
  getActive,
  getAssetIncidents,
  getIncident,
} from '../controllers/incidents.controller.js';
import { authenticateUser } from '../auth/middleware.js';
import { requireInventoryAccess } from '../auth/middleware.js';

export async function incidentRoutes(app: FastifyInstance) {
  // GET - Obtener todas las incidencias (cualquier usuario autenticado)
  app.get('/', { preHandler: authenticateUser }, getAllIncidents as any);

  // GET - Obtener incidencias activas
  app.get('/active', { preHandler: authenticateUser }, getActive as any);

  // GET - Obtener incidencias de un activo específico
  app.get('/asset/:assetId', { preHandler: authenticateUser }, getAssetIncidents as any);

  // GET - Obtener una incidencia específica
  app.get('/:id', { preHandler: authenticateUser }, getIncident as any);

  // POST - Reportar incidencia (cualquier usuario autenticado)
  app.post('/', { preHandler: authenticateUser }, reportAssetIncident as any);

  // POST - Investigar incidencia (solo ADMIN e INVENTORY_MANAGER)
  app.post('/:id/investigate', { preHandler: [authenticateUser, requireInventoryAccess] }, investigateAssetIncident as any);

  // POST - Resolver incidencia (solo ADMIN e INVENTORY_MANAGER)
  app.post('/:id/resolve', { preHandler: [authenticateUser, requireInventoryAccess] }, resolveAssetIncident as any);

  // POST - Cerrar incidencia (solo ADMIN e INVENTORY_MANAGER)
  app.post('/:id/close', { preHandler: [authenticateUser, requireInventoryAccess] }, closeAssetIncident as any);
}
