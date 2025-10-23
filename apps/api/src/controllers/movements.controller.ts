import { FastifyReply, FastifyRequest } from 'fastify';
import {
  registerEntry,
  registerExit,
  getMovementHistory,
  getMovementsByAsset,
  getMovementById,
} from '../movements/movementService.js';
import { MovementType, MovementSubtype } from '@prisma/client';

/**
 * Registra una entrada de activo
 */
export async function registerAssetEntry(
  request: FastifyRequest<{
    Body: {
      assetId: string;
      movementType: MovementSubtype;
      description: string;
      cost?: number;
      quantity?: number;
      date?: string;
      notes?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const userId = (request.user as any).id;
    const { assetId, movementType, description, cost, quantity, date, notes } = request.body;

    // Validar que el subtipo sea de entrada
    const validEntryTypes = [
      MovementSubtype.COMPRA,
      MovementSubtype.DONACION_IN,
      MovementSubtype.TRANSFERENCIA_IN,
    ];

    if (!validEntryTypes.includes(movementType)) {
      return reply.status(400).send({
        error: 'El tipo de movimiento no es válido para una entrada',
      });
    }

    const movement = await registerEntry({
      assetId,
      type: MovementType.ENTRADA,
      movementType,
      description,
      cost,
      quantity,
      userId,
      date: date ? new Date(date) : undefined,
      notes,
    });

    return reply.status(201).send(movement);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Registra una salida de activo
 */
export async function registerAssetExit(
  request: FastifyRequest<{
    Body: {
      assetId: string;
      movementType: MovementSubtype;
      description: string;
      cost?: number;
      quantity?: number;
      date?: string;
      notes?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const userId = (request.user as any).id;
    const { assetId, movementType, description, cost, quantity, date, notes } = request.body;

    // Validar que el subtipo sea de salida
    const validExitTypes = [
      MovementSubtype.BAJA,
      MovementSubtype.VENTA,
      MovementSubtype.DONACION_OUT,
      MovementSubtype.TRANSFERENCIA_OUT,
    ];

    if (!validExitTypes.includes(movementType)) {
      return reply.status(400).send({
        error: 'El tipo de movimiento no es válido para una salida',
      });
    }

    const movement = await registerExit({
      assetId,
      type: MovementType.SALIDA,
      movementType,
      description,
      cost,
      quantity,
      userId,
      date: date ? new Date(date) : undefined,
      notes,
    });

    return reply.status(201).send(movement);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene el historial de movimientos
 */
export async function getAllMovements(
  request: FastifyRequest<{
    Querystring: {
      assetId?: string;
      type?: MovementType;
      movementType?: MovementSubtype;
      startDate?: string;
      endDate?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { assetId, type, movementType, startDate, endDate } = request.query;

    const movements = await getMovementHistory({
      assetId,
      type,
      movementType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return reply.send(movements);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene los movimientos de un activo específico
 */
export async function getAssetMovements(
  request: FastifyRequest<{
    Params: {
      assetId: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { assetId } = request.params;
    const movements = await getMovementsByAsset(assetId);
    return reply.send(movements);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

/**
 * Obtiene un movimiento por ID
 */
export async function getMovement(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const movement = await getMovementById(id);

    if (!movement) {
      return reply.status(404).send({ error: 'Movimiento no encontrado' });
    }

    return reply.send(movement);
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}
