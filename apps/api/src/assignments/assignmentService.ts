import { PrismaClient, AssignmentStatus, AssetStatus, MovementType, MovementSubtype } from '@prisma/client'

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
    // Verificar que el activo existe
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
      include: { assignedTo: true }
    })

    if (!asset) {
      throw new Error('Activo no encontrado')
    }

    // Verificar si existe una asignación activa (no verificar solo assignedToId del activo)
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: data.assetId,
        status: AssignmentStatus.ACTIVE
      }
    })

    if (activeAssignment) {
      throw new Error('El activo ya tiene una asignación activa. Usa transferir o devolver primero.')
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

    // Crear la asignación, actualizar el activo y registrar movimiento en una transacción
    const [assignment, updatedAsset, movement] = await prisma.$transaction([
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
      }),
      // Registrar movimiento de inventario
      prisma.assetMovement.create({
        data: {
          assetId: data.assetId,
          type: MovementType.SALIDA,
          movementType: MovementSubtype.ASIGNACION,
          description: `Asignado a ${user.name || user.email}${data.reason ? ` - ${data.reason}` : ''}`,
          userId: data.assignedById,
          notes: data.notes,
          quantity: 1
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

    // Actualizar la asignación, el activo y registrar movimiento en una transacción
    const [updatedAssignment, updatedAsset, movement] = await prisma.$transaction([
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
      // Liberar el activo y devolverlo al almacén
      prisma.asset.update({
        where: { id: data.assetId },
        data: {
          assignedToId: null,
          assignedAt: null,
          currentLocation: null,
          building: 'Almacén',
          office: 'Depósito General',
          status: AssetStatus.AVAILABLE
        }
      }),
      // Registrar movimiento de inventario
      prisma.assetMovement.create({
        data: {
          assetId: data.assetId,
          type: MovementType.ENTRADA,
          movementType: MovementSubtype.DEVOLUCION,
          description: `Devuelto por ${activeAssignment.assignedTo.name || activeAssignment.assignedTo.email} al Almacén - Depósito General`,
          userId: data.userId,
          notes: data.notes,
          quantity: 1
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
    building?: string
    office?: string
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

    // Marcar asignación actual como transferida, crear nueva asignación y registrar movimiento
    const [oldAssignment, newAssignment, updatedAsset, movement] = await prisma.$transaction([
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
          location: data.building && data.office ? `${data.building} - ${data.office}` : activeAssignment.location,
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
      // Actualizar el activo con el nuevo responsable y ubicación
      prisma.asset.update({
        where: { id: data.assetId },
        data: {
          assignedToId: data.newAssignedToId,
          assignedAt: new Date(),
          currentLocation: data.building && data.office ? `${data.building} - ${data.office}` : activeAssignment.location,
          building: data.building || activeAssignment.asset.building,
          office: data.office || activeAssignment.asset.office
        }
      }),
      // Registrar movimiento de inventario
      prisma.assetMovement.create({
        data: {
          assetId: data.assetId,
          type: MovementType.SALIDA,
          movementType: MovementSubtype.TRANSFERENCIA_OUT,
          description: `Transferido de ${activeAssignment.assignedTo.name || activeAssignment.assignedTo.email} a ${newUser.name || newUser.email}${data.reason ? ` - ${data.reason}` : ''}`,
          userId: data.assignedById,
          notes: data.notes,
          quantity: 1
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
