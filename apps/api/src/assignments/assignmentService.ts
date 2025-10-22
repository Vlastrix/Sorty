import { PrismaClient, AssignmentStatus, AssetStatus } from '@prisma/client'

const prisma = new PrismaClient()

export class AssignmentService {
  /**
   * Asignar un activo a un usuario
   */
  static async assignAsset(data: {
    assetId: string
    assignedToId: string
    assignedById: string
    location?: string
    reason?: string
    notes?: string
  }) {
    // Verificar que el activo existe y está disponible
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
      include: { assignedTo: true }
    })

    if (!asset) {
      throw new Error('Activo no encontrado')
    }

    if (asset.assignedToId) {
      throw new Error('El activo ya está asignado a otro usuario')
    }

    // Verificar que el usuario receptor existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: data.assignedToId }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    if (!user.isActive) {
      throw new Error('El usuario está inactivo y no puede recibir asignaciones')
    }

    // Crear la asignación y actualizar el activo en una transacción
    const [assignment, updatedAsset] = await prisma.$transaction([
      // Crear registro de asignación
      prisma.assetAssignment.create({
        data: {
          assetId: data.assetId,
          assignedToId: data.assignedToId,
          assignedById: data.assignedById,
          location: data.location,
          reason: data.reason,
          notes: data.notes,
          status: AssignmentStatus.ACTIVE
        },
        include: {
          asset: {
            include: {
              category: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          },
          assignedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      }),
      // Actualizar el activo
      prisma.asset.update({
        where: { id: data.assetId },
        data: {
          assignedToId: data.assignedToId,
          assignedAt: new Date(),
          currentLocation: data.location,
          status: AssetStatus.IN_USE
        }
      })
    ])

    return assignment
  }

  /**
   * Devolver un activo (marcar asignación como RETURNED)
   */
  static async returnAsset(data: {
    assetId: string
    userId: string
    notes?: string
  }) {
    // Buscar la asignación activa del activo
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: data.assetId,
        status: AssignmentStatus.ACTIVE
      },
      include: {
        asset: true,
        assignedTo: true
      }
    })

    if (!activeAssignment) {
      throw new Error('No hay una asignación activa para este activo')
    }

    // Actualizar la asignación y el activo en una transacción
    const [updatedAssignment, updatedAsset] = await prisma.$transaction([
      // Marcar asignación como devuelta
      prisma.assetAssignment.update({
        where: { id: activeAssignment.id },
        data: {
          status: AssignmentStatus.RETURNED,
          returnedAt: new Date(),
          notes: data.notes
        },
        include: {
          asset: {
            include: {
              category: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          },
          assignedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      }),
      // Liberar el activo
      prisma.asset.update({
        where: { id: data.assetId },
        data: {
          assignedToId: null,
          assignedAt: null,
          status: AssetStatus.AVAILABLE
        }
      })
    ])

    return updatedAssignment
  }

  /**
   * Transferir un activo de un usuario a otro
   */
  static async transferAsset(data: {
    assetId: string
    newAssignedToId: string
    assignedById: string
    location?: string
    reason?: string
    notes?: string
  }) {
    // Buscar la asignación activa
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: data.assetId,
        status: AssignmentStatus.ACTIVE
      },
      include: {
        asset: true,
        assignedTo: true
      }
    })

    if (!activeAssignment) {
      throw new Error('No hay una asignación activa para este activo')
    }

    // Verificar que el nuevo usuario existe y está activo
    const newUser = await prisma.user.findUnique({
      where: { id: data.newAssignedToId }
    })

    if (!newUser) {
      throw new Error('Usuario destino no encontrado')
    }

    if (!newUser.isActive) {
      throw new Error('El usuario destino está inactivo y no puede recibir asignaciones')
    }

    if (activeAssignment.assignedToId === data.newAssignedToId) {
      throw new Error('El activo ya está asignado a este usuario')
    }

    // Marcar asignación actual como transferida y crear nueva asignación
    const [oldAssignment, newAssignment, updatedAsset] = await prisma.$transaction([
      // Marcar asignación anterior como transferida
      prisma.assetAssignment.update({
        where: { id: activeAssignment.id },
        data: {
          status: AssignmentStatus.TRANSFERRED,
          returnedAt: new Date(),
          notes: data.notes ? `Transferido. ${data.notes}` : 'Transferido'
        }
      }),
      // Crear nueva asignación
      prisma.assetAssignment.create({
        data: {
          assetId: data.assetId,
          assignedToId: data.newAssignedToId,
          assignedById: data.assignedById,
          location: data.location || activeAssignment.location,
          reason: data.reason || 'Transferencia',
          notes: data.notes,
          status: AssignmentStatus.ACTIVE
        },
        include: {
          asset: {
            include: {
              category: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          },
          assignedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      }),
      // Actualizar el activo
      prisma.asset.update({
        where: { id: data.assetId },
        data: {
          assignedToId: data.newAssignedToId,
          assignedAt: new Date(),
          currentLocation: data.location || activeAssignment.location
        }
      })
    ])

    return newAssignment
  }

  /**
   * Obtener historial completo de asignaciones
   */
  static async getAssignmentHistory(filters?: {
    assetId?: string
    userId?: string
    status?: AssignmentStatus
  }) {
    const where: any = {}

    if (filters?.assetId) {
      where.assetId = filters.assetId
    }

    if (filters?.userId) {
      where.assignedToId = filters.userId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    return prisma.assetAssignment.findMany({
      where,
      include: {
        asset: {
          include: {
            category: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })
  }

  /**
   * Obtener solo las asignaciones activas
   */
  static async getActiveAssignments() {
    return prisma.assetAssignment.findMany({
      where: {
        status: AssignmentStatus.ACTIVE
      },
      include: {
        asset: {
          include: {
            category: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })
  }

  /**
   * Obtener una asignación específica por ID
   */
  static async getAssignmentById(id: string) {
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            category: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!assignment) {
      throw new Error('Asignación no encontrada')
    }

    return assignment
  }

  /**
   * Obtener historial de asignaciones de un activo específico
   */
  static async getAssetAssignmentHistory(assetId: string) {
    return this.getAssignmentHistory({ assetId })
  }

  /**
   * Obtener historial de asignaciones de un usuario específico
   */
  static async getUserAssignmentHistory(userId: string) {
    return this.getAssignmentHistory({ userId })
  }
}
