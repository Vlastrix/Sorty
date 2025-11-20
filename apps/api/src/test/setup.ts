import { vi, beforeEach } from 'vitest'

// Export mocked Prisma functions first
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  asset: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  category: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  assetAssignment: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  assetMovement: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  maintenance: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  incident: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn((fn) => fn(mockPrisma)),
}

// Mock de Prisma Client con enums
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
  UserRole: {
    ADMIN: 'ADMIN',
    WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
    ASSET_RESPONSIBLE: 'ASSET_RESPONSIBLE'
  },
  AssetStatus: {
    AVAILABLE: 'AVAILABLE',
    IN_USE: 'IN_USE',
    IN_REPAIR: 'IN_REPAIR',
    DECOMMISSIONED: 'DECOMMISSIONED'
  },
  AssignmentStatus: {
    ACTIVE: 'ACTIVE',
    RETURNED: 'RETURNED',
    TRANSFERRED: 'TRANSFERRED'
  },
  MovementType: {
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA'
  },
  MovementSubtype: {
    COMPRA: 'COMPRA',
    DONACION_IN: 'DONACION_IN',
    TRANSFERENCIA_IN: 'TRANSFERENCIA_IN',
    DEVOLUCION: 'DEVOLUCION',
    VENTA: 'VENTA',
    DONACION_OUT: 'DONACION_OUT',
    TRANSFERENCIA_OUT: 'TRANSFERENCIA_OUT',
    BAJA: 'BAJA',
    ASIGNACION: 'ASIGNACION'
  },
  MaintenanceType: {
    PREVENTIVO: 'PREVENTIVO',
    CORRECTIVO: 'CORRECTIVO'
  },
  MaintenanceStatus: {
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  },
  IncidentType: {
    DANO: 'DANO',
    ROBO: 'ROBO',
    PERDIDA: 'PERDIDA',
    MAL_FUNCIONAMIENTO: 'MAL_FUNCIONAMIENTO'
  },
  IncidentStatus: {
    REPORTED: 'REPORTED',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
  },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string
      constructor(message: string, { code }: { code: string }) {
        super(message)
        this.code = code
        this.name = 'PrismaClientKnownRequestError'
      }
    }
  }
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