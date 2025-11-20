import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as MovementService from '@/movements/movementService'
import { mockPrisma } from '../setup'

describe('MovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerEntry', () => {
    it('should register an entry movement', async () => {
      const entryData = {
        assetId: 'asset-1',
        type: 'ENTRADA' as const,
        movementType: 'COMPRA' as const,
        description: 'Purchase of new equipment',
        cost: 1000,
        quantity: 1,
        userId: 'user-1'
      }

      const mockMovement = {
        id: 'mov-1',
        ...entryData,
        date: new Date()
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'asset-1', status: 'AVAILABLE' })
      mockPrisma.assetMovement.create.mockResolvedValue(mockMovement)

      const result = await MovementService.registerEntry(entryData)

      expect(mockPrisma.assetMovement.create).toHaveBeenCalled()
      expect(result).toEqual(mockMovement)
    })

    it('should use current date if not provided', async () => {
      const entryData = {
        assetId: 'asset-1',
        type: 'ENTRADA' as const,
        movementType: 'DONACION_IN' as const,
        description: 'Donation received',
        userId: 'user-1'
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'asset-1' })
      mockPrisma.assetMovement.create.mockResolvedValue({
        id: 'mov-1',
        ...entryData,
        date: new Date()
      })

      await MovementService.registerEntry(entryData)

      expect(mockPrisma.assetMovement.create).toHaveBeenCalled()
    })
  })

  describe('registerExit', () => {
    it('should register an exit movement', async () => {
      const exitData = {
        assetId: 'asset-1',
        type: 'SALIDA' as const,
        movementType: 'VENTA' as const,
        description: 'Sale of old equipment',
        cost: 500,
        quantity: 1,
        userId: 'user-1'
      }

      const mockMovement = {
        id: 'mov-2',
        ...exitData,
        date: new Date()
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'asset-1', assignedToId: null })
      mockPrisma.assetMovement.create.mockResolvedValue(mockMovement)

      const result = await MovementService.registerExit(exitData)

      expect(mockPrisma.assetMovement.create).toHaveBeenCalled()
      expect(result).toEqual(mockMovement)
    })
  })

  describe('getMovementHistory', () => {
    it('should return all movements', async () => {
      const mockMovements = [
        {
          id: 'mov-1',
          type: 'ENTRADA',
          movementType: 'COMPRA',
          assetId: 'asset-1'
        },
        {
          id: 'mov-2',
          type: 'SALIDA',
          movementType: 'VENTA',
          assetId: 'asset-2'
        }
      ]

      mockPrisma.assetMovement.findMany.mockResolvedValue(mockMovements)

      const result = await MovementService.getMovementHistory({})

      expect(mockPrisma.assetMovement.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockMovements)
    })

    it('should filter by movement type', async () => {
      mockPrisma.assetMovement.findMany.mockResolvedValue([])

      await MovementService.getMovementHistory({ type: 'ENTRADA' })

      expect(mockPrisma.assetMovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'ENTRADA' })
        })
      )
    })

    it('should filter by asset', async () => {
      mockPrisma.assetMovement.findMany.mockResolvedValue([])

      await MovementService.getMovementHistory({ assetId: 'asset-1' })

      expect(mockPrisma.assetMovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assetId: 'asset-1' })
        })
      )
    })
  })

  describe('getMovementById', () => {
    it('should return movement by id', async () => {
      const mockMovement = {
        id: 'mov-1',
        type: 'ENTRADA',
        movementType: 'COMPRA'
      }

      mockPrisma.assetMovement.findUnique.mockResolvedValue(mockMovement)

      const result = await MovementService.getMovementById('mov-1')

      expect(mockPrisma.assetMovement.findUnique).toHaveBeenCalledWith({
        where: { id: 'mov-1' },
        include: expect.any(Object)
      })
      expect(result).toEqual(mockMovement)
    })

    it('should return null when movement not found', async () => {
      mockPrisma.assetMovement.findUnique.mockResolvedValue(null)

      const result = await MovementService.getMovementById('nonexistent')
      
      expect(result).toBeNull()
    })
  })
})
