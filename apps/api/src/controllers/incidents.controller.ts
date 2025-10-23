import { FastifyReply, FastifyRequest } from 'fastify';
import {
  reportIncident,
  resolveIncident,
  investigateIncident,
  closeIncident,
  getIncidentHistory,
  getActiveIncidents,
  getIncidentsByAsset,
  getIncidentById,
} from '../incidents/incidentService.js';
import { IncidentType, IncidentStatus } from '@prisma/client';

/**
 * Reporta una nueva incidencia
 */
export async function reportAssetIncident(
  request: FastifyRequest<{
    Body: {
      assetId: string;
      type: IncidentType;
      description: string;
      cost?: number;
      notes?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const reportedById = (request.user as any).id;
    const { assetId, type, description, cost, notes } = request.body;

    const incident = await reportIncident({
      assetId,
      type,
      description,
      reportedById,
      cost,
      notes,
    });

    return reply.status(201).send(incident);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Resuelve una incidencia
 */
export async function resolveAssetIncident(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: {
      resolution: string;
      resolvedDate?: string;
      cost?: number;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { resolution, resolvedDate, cost } = request.body;

    const incident = await resolveIncident({
      incidentId: id,
      resolution,
      resolvedDate: resolvedDate ? new Date(resolvedDate) : undefined,
      cost,
    });

    return reply.send(incident);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Marca una incidencia como en investigación
 */
export async function investigateAssetIncident(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const incident = await investigateIncident(id);
    return reply.send(incident);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Cierra una incidencia
 */
export async function closeAssetIncident(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const incident = await closeIncident(id);
    return reply.send(incident);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene el historial de incidencias
 */
export async function getAllIncidents(
  request: FastifyRequest<{
    Querystring: {
      assetId?: string;
      type?: IncidentType;
      status?: IncidentStatus;
      startDate?: string;
      endDate?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { assetId, type, status, startDate, endDate } = request.query;

    const incidents = await getIncidentHistory({
      assetId,
      type,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return reply.send(incidents);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene las incidencias activas
 */
export async function getActive(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const incidents = await getActiveIncidents();
    return reply.send(incidents);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene las incidencias de un activo específico
 */
export async function getAssetIncidents(
  request: FastifyRequest<{
    Params: {
      assetId: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { assetId } = request.params;
    const incidents = await getIncidentsByAsset(assetId);
    return reply.send(incidents);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene una incidencia por ID
 */
export async function getIncident(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const incident = await getIncidentById(id);

    if (!incident) {
      return reply.status(404).send({ error: 'Incidencia no encontrada' });
    }

    return reply.send(incident);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}
