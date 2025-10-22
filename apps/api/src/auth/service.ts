import argon2 from 'argon2'
import { PrismaClient, UserRole } from '@prisma/client'
import { generateToken, type JWTPayload } from './jwt.js'
import type { RegisterInput, LoginInput } from './schemas.js'

const prisma = new PrismaClient()

export async function registerUser(data: RegisterInput) {
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('El usuario ya existe')
  }

  // Hash de la contraseña
  const hashedPassword = await argon2.hash(data.password)

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || UserRole.ASSET_RESPONSIBLE
    }
  })

  // Generar token
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  const token = generateToken(payload)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  }
}

export async function loginUser(data: LoginInput) {
  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user) {
    throw new Error('Credenciales inválidas')
  }

  // Verificar si el usuario está activo
  if (!user.isActive) {
    throw new Error('Usuario inactivo. Contacte al administrador')
  }

  // Verificar contraseña
  const isValidPassword = await argon2.verify(user.password, data.password)

  if (!isValidPassword) {
    throw new Error('Credenciales inválidas')
  }

  // Generar token
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  const token = generateToken(payload)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  }
}