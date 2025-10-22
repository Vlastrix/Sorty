import { PrismaClient, UserRole } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

export interface CreateUserInput {
  email: string
  password: string
  name?: string
  role: UserRole
}

export interface UpdateUserInput {
  email?: string
  name?: string
  role?: UserRole
  isActive?: boolean
}

export interface UpdateUserPasswordInput {
  currentPassword: string
  newPassword: string
}

/**
 * Obtener todos los usuarios (solo admin)
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          createdAssets: true,
          assignedAssets: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          createdAssets: true,
          assignedAssets: true
        }
      }
    }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  return user
}

/**
 * Crear nuevo usuario (solo admin)
 */
export async function createUser(data: CreateUserInput) {
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado')
  }

  // Hash de la contraseña
  const hashedPassword = await argon2.hash(data.password)

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return user
}

/**
 * Actualizar usuario (admin puede actualizar cualquier usuario)
 */
export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Si se está actualizando el email, verificar que no exista
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado')
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...(data.email && { email: data.email }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.role && { role: data.role }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return updatedUser
}

/**
 * Cambiar contraseña de usuario
 */
export async function updateUserPassword(
  userId: string, 
  data: UpdateUserPasswordInput
) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Verificar contraseña actual
  const isValidPassword = await argon2.verify(user.password, data.currentPassword)

  if (!isValidPassword) {
    throw new Error('Contraseña actual incorrecta')
  }

  // Hash de la nueva contraseña
  const hashedPassword = await argon2.hash(data.newPassword)

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })

  return { success: true, message: 'Contraseña actualizada correctamente' }
}

/**
 * Eliminar usuario (solo admin, no puede eliminarse a sí mismo)
 */
export async function deleteUser(id: string, requestingUserId: string) {
  if (id === requestingUserId) {
    throw new Error('No puedes eliminar tu propia cuenta')
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          createdAssets: true,
          assignedAssets: true
        }
      }
    }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Verificar si tiene activos asignados o creados
  if (user._count.assignedAssets > 0) {
    throw new Error(
      `No se puede eliminar el usuario porque tiene ${user._count.assignedAssets} activo(s) asignado(s)`
    )
  }

  if (user._count.createdAssets > 0) {
    // En vez de eliminar, desactivar el usuario
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    return { 
      success: true, 
      message: 'Usuario desactivado (tiene activos creados)',
      user: deactivatedUser
    }
  }

  // Eliminar usuario
  await prisma.user.delete({
    where: { id }
  })

  return { 
    success: true, 
    message: 'Usuario eliminado correctamente' 
  }
}

/**
 * Obtener usuarios responsables (para asignar activos)
 */
export async function getResponsibleUsers() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      role: {
        in: [UserRole.ASSET_RESPONSIBLE, UserRole.INVENTORY_MANAGER, UserRole.ADMIN]
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      _count: {
        select: {
          assignedAssets: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

/**
 * Obtener activos asignados a un usuario
 */
export async function getUserAssignedAssets(userId: string) {
  return prisma.asset.findMany({
    where: { assignedToId: userId },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      assignedAt: 'desc'
    }
  })
}
