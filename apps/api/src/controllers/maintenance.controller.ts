import { FastifyReply, FastifyRequest } from 'fastify';
import {
  scheduleMaintenance,
  completeMaintenance,
  cancelMaintenance,
  startMaintenance,
  getMaintenanceHistory,
  getUpcomingMaintenance,
  getMaintenancesByAsset,
  getMaintenanceById,
} from '../maintenance/maintenanceService.js';
import { MaintenanceType, MaintenanceStatus } from '@prisma/client';

/**
 * Programa un mantenimiento
 */
export async function scheduleAssetMaintenance(
  request: FastifyRequest<{
    Body: {
      assetId: string;
      type: MaintenanceType;
      scheduledDate: string;
      description: string;
      performedBy?: string;
      cost?: number;
      notes?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const userId = (request.user as any).id;
    const { assetId, type, scheduledDate, description, performedBy, cost, notes } = request.body;

    const maintenance = await scheduleMaintenance({
      assetId,
      type,
      scheduledDate: new Date(scheduledDate),
      description,
      performedBy,
      cost,
      userId,
      notes,
    });

    return reply.status(201).send(maintenance);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Marca un mantenimiento como completado
 */
export async function completeAssetMaintenance(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: {
      completedDate?: string;
      cost?: number;
      notes?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { completedDate, cost, notes } = request.body;

    const maintenance = await completeMaintenance({
      maintenanceId: id,
      completedDate: completedDate ? new Date(completedDate) : undefined,
      cost,
      notes,
    });

    return reply.send(maintenance);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Inicia un mantenimiento
 */
export async function startAssetMaintenance(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const maintenance = await startMaintenance(id);
    return reply.send(maintenance);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Cancela un mantenimiento
 */
export async function cancelAssetMaintenance(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const maintenance = await cancelMaintenance(id);
    return reply.send(maintenance);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene el historial de mantenimientos
 */
export async function getAllMaintenances(
  request: FastifyRequest<{
    Querystring: {
      assetId?: string;
      type?: MaintenanceType;
      status?: MaintenanceStatus;
      startDate?: string;
      endDate?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { assetId, type, status, startDate, endDate } = request.query;

    const maintenances = await getMaintenanceHistory({
      assetId,
      type,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return reply.send(maintenances);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene los próximos mantenimientos
 */
export async function getUpcoming(
  request: FastifyRequest<{
    Querystring: {
      days?: number;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { days } = request.query;
    const maintenances = await getUpcomingMaintenance(days);
    return reply.send(maintenances);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene los mantenimientos de un activo específico
 */
export async function getAssetMaintenances(
  request: FastifyRequest<{
    Params: {
      assetId: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { assetId } = request.params;
    const maintenances = await getMaintenancesByAsset(assetId);
    return reply.send(maintenances);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene un mantenimiento por ID
 */
export async function getMaintenance(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const maintenance = await getMaintenanceById(id);

    if (!maintenance) {
      return reply.status(404).send({ error: 'Mantenimiento no encontrado' });
    }

    return reply.send(maintenance);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}
