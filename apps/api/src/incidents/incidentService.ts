import { PrismaClient, IncidentType, IncidentStatus, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ReportIncidentData {
  assetId: string;
  type: IncidentType;
  description: string;
  reportedById: string;
  cost?: number;
  notes?: string;
}

interface ResolveIncidentData {
  incidentId: string;
  resolution: string;
  resolvedDate?: Date;
  cost?: number;
}

/**
 * Reporta una incidencia en un activo
 */
export async function reportIncident(data: ReportIncidentData) {
  return await prisma.$transaction(async (tx) => {
    // Verificar que el activo existe
    const asset = await tx.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new Error('El activo no existe');
    }

    if (asset.status === AssetStatus.DECOMMISSIONED) {
      throw new Error('No se pueden reportar incidencias para activos dados de baja');
    }

    // Crear la incidencia
    const incident = await tx.incident.create({
      data: {
        assetId: data.assetId,
        type: data.type,
        description: data.description,
        reportedById: data.reportedById,
        cost: data.cost,
        notes: data.notes,
        status: IncidentStatus.REPORTED,
      },
      include: {
        asset: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Si es un robo o pérdida, actualizar el estado del activo
    if (data.type === IncidentType.ROBO || data.type === IncidentType.PERDIDA) {
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

    return incident;
  });
}

/**
 * Resuelve una incidencia
 */
export async function resolveIncident(data: ResolveIncidentData) {
  return await prisma.$transaction(async (tx) => {
    // Verificar que la incidencia existe
    const incident = await tx.incident.findUnique({
      where: { id: data.incidentId },
      include: { asset: true },
    });

    if (!incident) {
      throw new Error('La incidencia no existe');
    }

    if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED) {
      throw new Error('La incidencia ya está resuelta o cerrada');
    }

    // Actualizar la incidencia
    const updated = await tx.incident.update({
      where: { id: data.incidentId },
      data: {
        status: IncidentStatus.RESOLVED,
        resolution: data.resolution,
        resolvedDate: data.resolvedDate || new Date(),
        cost: data.cost !== undefined ? data.cost : incident.cost,
      },
      include: {
        asset: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Si el activo está en reparación por daño, volverlo a disponible o en uso
    if (
      incident.type === IncidentType.DANO && 
      incident.asset.status === AssetStatus.IN_REPAIR
    ) {
      await tx.asset.update({
        where: { id: incident.assetId },
        data: {
          status: incident.asset.assignedToId 
            ? AssetStatus.IN_USE 
            : AssetStatus.AVAILABLE,
        },
      });
    }

    return updated;
  });
}

/**
 * Marca una incidencia como en investigación
 */
export async function investigateIncident(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });

  if (!incident) {
    throw new Error('La incidencia no existe');
  }

  if (incident.status !== IncidentStatus.REPORTED) {
    throw new Error('Solo se pueden investigar incidencias reportadas');
  }

  return await prisma.incident.update({
    where: { id: incidentId },
    data: { status: IncidentStatus.INVESTIGATING },
    include: {
      asset: true,
      reportedBy: {
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
 * Cierra una incidencia resuelta
 */
export async function closeIncident(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });

  if (!incident) {
    throw new Error('La incidencia no existe');
  }

  if (incident.status !== IncidentStatus.RESOLVED) {
    throw new Error('Solo se pueden cerrar incidencias resueltas');
  }

  return await prisma.incident.update({
    where: { id: incidentId },
    data: { status: IncidentStatus.CLOSED },
    include: {
      asset: true,
      reportedBy: {
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
 * Obtiene el historial de incidencias con filtros
 */
export async function getIncidentHistory(filters?: {
  assetId?: string;
  type?: IncidentType;
  status?: IncidentStatus;
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
    where.reportedDate = {};
    if (filters.startDate) {
      where.reportedDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.reportedDate.lte = filters.endDate;
    }
  }

  return await prisma.incident.findMany({
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
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      reportedDate: 'desc',
    },
  });
}

/**
 * Obtiene las incidencias activas (reportadas o en investigación)
 */
export async function getActiveIncidents() {
  return await prisma.incident.findMany({
    where: {
      status: {
        in: [IncidentStatus.REPORTED, IncidentStatus.INVESTIGATING],
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
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      reportedDate: 'desc',
    },
  });
}

/**
 * Obtiene las incidencias de un activo específico
 */
export async function getIncidentsByAsset(assetId: string) {
  return await prisma.incident.findMany({
    where: { assetId },
    include: {
      asset: true,
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      reportedDate: 'desc',
    },
  });
}

/**
 * Obtiene una incidencia por ID
 */
export async function getIncidentById(id: string) {
  return await prisma.incident.findUnique({
    where: { id },
    include: {
      asset: true,
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
