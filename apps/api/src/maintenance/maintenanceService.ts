import { PrismaClient, MaintenanceType, MaintenanceStatus, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ScheduleMaintenanceData {
  assetId: string;
  type: MaintenanceType;
  scheduledDate: Date;
  description: string;
  performedBy?: string;
  cost?: number;
  userId: string;
  notes?: string;
}

interface CompleteMaintenanceData {
  maintenanceId: string;
  completedDate?: Date;
  cost?: number;
  notes?: string;
}

/**
 * Programa un mantenimiento para un activo
 */
export async function scheduleMaintenance(data: ScheduleMaintenanceData) {
  return await prisma.$transaction(async (tx) => {
    // Verificar que el activo existe
    const asset = await tx.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new Error('El activo no existe');
    }

    if (asset.status === AssetStatus.DECOMMISSIONED) {
      throw new Error('No se puede programar mantenimiento para un activo dado de baja');
    }

    // Crear el mantenimiento
    const maintenance = await tx.maintenance.create({
      data: {
        assetId: data.assetId,
        type: data.type,
        scheduledDate: data.scheduledDate,
        description: data.description,
        performedBy: data.performedBy,
        cost: data.cost,
        userId: data.userId,
        notes: data.notes,
        status: MaintenanceStatus.SCHEDULED,
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

    return maintenance;
  });
}

/**
 * Marca un mantenimiento como completado
 */
export async function completeMaintenance(data: CompleteMaintenanceData) {
  return await prisma.$transaction(async (tx) => {
    // Verificar que el mantenimiento existe
    const maintenance = await tx.maintenance.findUnique({
      where: { id: data.maintenanceId },
      include: { asset: true },
    });

    if (!maintenance) {
      throw new Error('El mantenimiento no existe');
    }

    if (maintenance.status === MaintenanceStatus.COMPLETED) {
      throw new Error('El mantenimiento ya está completado');
    }

    if (maintenance.status === MaintenanceStatus.CANCELLED) {
      throw new Error('El mantenimiento está cancelado');
    }

    // Actualizar el mantenimiento
    const updated = await tx.maintenance.update({
      where: { id: data.maintenanceId },
      data: {
        status: MaintenanceStatus.COMPLETED,
        completedDate: data.completedDate || new Date(),
        cost: data.cost !== undefined ? data.cost : maintenance.cost,
        notes: data.notes !== undefined ? data.notes : maintenance.notes,
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

    // Si el activo estaba en reparación, volverlo a disponible o en uso
    if (maintenance.asset.status === AssetStatus.IN_REPAIR) {
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: {
          status: maintenance.asset.assignedToId 
            ? AssetStatus.IN_USE 
            : AssetStatus.AVAILABLE,
        },
      });
    }

    return updated;
  });
}

/**
 * Cancela un mantenimiento programado
 */
export async function cancelMaintenance(maintenanceId: string) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id: maintenanceId },
  });

  if (!maintenance) {
    throw new Error('El mantenimiento no existe');
  }

  if (maintenance.status === MaintenanceStatus.COMPLETED) {
    throw new Error('No se puede cancelar un mantenimiento completado');
  }

  return await prisma.maintenance.update({
    where: { id: maintenanceId },
    data: { status: MaintenanceStatus.CANCELLED },
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

/**
 * Marca un mantenimiento como en progreso
 */
export async function startMaintenance(maintenanceId: string) {
  return await prisma.$transaction(async (tx) => {
    const maintenance = await tx.maintenance.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new Error('El mantenimiento no existe');
    }

    if (maintenance.status !== MaintenanceStatus.SCHEDULED) {
      throw new Error('Solo se pueden iniciar mantenimientos programados');
    }

    // Actualizar el mantenimiento
    const updated = await tx.maintenance.update({
      where: { id: maintenanceId },
      data: { status: MaintenanceStatus.IN_PROGRESS },
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

    // Actualizar el estado del activo a EN REPARACIÓN
    await tx.asset.update({
      where: { id: maintenance.assetId },
      data: { status: AssetStatus.IN_REPAIR },
    });

    return updated;
  });
}

/**
 * Obtiene el historial de mantenimientos con filtros
 */
export async function getMaintenanceHistory(filters?: {
  assetId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
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

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.scheduledDate = {};
    if (filters.startDate) {
      where.scheduledDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.scheduledDate.lte = filters.endDate;
    }
  }

  return await prisma.maintenance.findMany({
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
      scheduledDate: 'desc',
    },
  });
}

/**
 * Obtiene los próximos mantenimientos programados
 */
export async function getUpcomingMaintenance(days: number = 30) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return await prisma.maintenance.findMany({
    where: {
      status: {
        in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
      },
      scheduledDate: {
        gte: now,
        lte: futureDate,
      },
    },
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
      scheduledDate: 'asc',
    },
  });
}

/**
 * Obtiene los mantenimientos de un activo específico
 */
export async function getMaintenancesByAsset(assetId: string) {
  return await prisma.maintenance.findMany({
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
      scheduledDate: 'desc',
    },
  });
}

/**
 * Obtiene un mantenimiento por ID
 */
export async function getMaintenanceById(id: string) {
  return await prisma.maintenance.findUnique({
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
