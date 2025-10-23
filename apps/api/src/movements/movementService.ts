import { PrismaClient, MovementType, MovementSubtype, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface RegisterMovementData {
  assetId: string;
  type: MovementType;
  movementType: MovementSubtype;
  description: string;
  cost?: number;
  quantity?: number;
  userId: string;
  date?: Date;
  notes?: string;
}

/**
 * Registra un movimiento de entrada de activo
 */
export async function registerEntry(data: RegisterMovementData) {
  return await prisma.$transaction(async (tx) => {
    // Verificar que el activo existe
    const asset = await tx.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new Error('El activo no existe');
    }

    // Crear el movimiento
    const movement = await tx.assetMovement.create({
      data: {
        assetId: data.assetId,
        type: MovementType.ENTRADA,
        movementType: data.movementType,
        description: data.description,
        cost: data.cost,
        quantity: data.quantity || 1,
        userId: data.userId,
        date: data.date || new Date(),
        notes: data.notes,
      },
      include: {
        asset: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Si es una compra o donación recibida, actualizar estado a AVAILABLE si no está asignado
    if (
      (data.movementType === MovementSubtype.COMPRA || 
       data.movementType === MovementSubtype.DONACION_IN ||
       data.movementType === MovementSubtype.TRANSFERENCIA_IN) &&
      asset.status === AssetStatus.DECOMMISSIONED
    ) {
      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });
    }

    return movement;
  });
}

/**
 * Registra un movimiento de salida de activo
 */
export async function registerExit(data: RegisterMovementData) {
  return await prisma.$transaction(async (tx) => {
    // Verificar que el activo existe
    const asset = await tx.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new Error('El activo no existe');
    }

    // Verificar si el activo está asignado
    if (asset.assignedToId && data.movementType === MovementSubtype.BAJA) {
      throw new Error('No se puede dar de baja un activo que está asignado');
    }

    // Crear el movimiento
    const movement = await tx.assetMovement.create({
      data: {
        assetId: data.assetId,
        type: MovementType.SALIDA,
        movementType: data.movementType,
        description: data.description,
        cost: data.cost,
        quantity: data.quantity || 1,
        userId: data.userId,
        date: data.date || new Date(),
        notes: data.notes,
      },
      include: {
        asset: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Si es una baja, actualizar el estado del activo
    if (data.movementType === MovementSubtype.BAJA) {
      await tx.asset.update({
        where: { id: data.assetId },
        data: { 
          status: AssetStatus.DECOMMISSIONED,
          assignedToId: null,
          assignedAt: null,
          currentLocation: null,
        },
      });
    }

    return movement;
  });
}

/**
 * Obtiene el historial de movimientos con filtros
 */
export async function getMovementHistory(filters?: {
  assetId?: string;
  type?: MovementType;
  movementType?: MovementSubtype;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (filters?.assetId) {
    where.assetId = filters.assetId;
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.movementType) {
    where.movementType = filters.movementType;
  }

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.date.lte = filters.endDate;
    }
  }

  return await prisma.assetMovement.findMany({
    where,
    include: {
      asset: {
        select: {
          id: true,
          code: true,
          name: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Obtiene los movimientos de un activo específico
 */
export async function getMovementsByAsset(assetId: string) {
  return await prisma.assetMovement.findMany({
    where: { assetId },
    include: {
      asset: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Obtiene un movimiento por ID
 */
export async function getMovementById(id: string) {
  return await prisma.assetMovement.findUnique({
    where: { id },
    include: {
      asset: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
