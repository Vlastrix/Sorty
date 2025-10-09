import { vi, beforeEach } from 'vitest'

// Mock de Prisma Client
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  asset: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
}

// Mock del constructor de Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}))

// Mock de argon2
export const mockArgon2 = {
  hash: vi.fn(),
  verify: vi.fn(),
}

vi.mock('argon2', () => ({
  default: mockArgon2,
  ...mockArgon2
}))

// Mock de JWT utilities
export const mockJWT = {
  generateToken: vi.fn(),
  verifyToken: vi.fn(),
}

vi.mock('@/auth/jwt.js', () => mockJWT)

// Mock de variables de entorno
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/sorty_test'

// Limpiar mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks()
})