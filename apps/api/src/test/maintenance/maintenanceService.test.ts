import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as MaintenanceService from '@/maintenance/maintenanceService'
import { mockPrisma } from '../setup'

describe('MaintenanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('scheduleMaintenance', () => {
    it('should create a new maintenance record', async () => {
      const maintenanceData = {
        assetId: 'asset-1',
        type: 'PREVENTIVO' as const,
        scheduledDate: new Date('2024-12-01'),
        description: 'Regular maintenance',
        performedBy: 'Tech John',
        userId: 'user-1'
      }

      const mockMaintenance = {
        id: 'maint-1',
        ...maintenanceData,
        status: 'SCHEDULED',
        createdAt: new Date()
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'asset-1', status: 'AVAILABLE' })
      mockPrisma.maintenance.create.mockResolvedValue(mockMaintenance)

      const result = await MaintenanceService.scheduleMaintenance(maintenanceData)

      expect(mockPrisma.maintenance.create).toHaveBeenCalled()
      expect(result).toEqual(mockMaintenance)
    })
  })

  describe('getMaintenanceHistory', () => {
    it('should return all maintenance records', async () => {
      const mockMaintenances = [
        {
          id: 'maint-1',
          type: 'PREVENTIVO',
          status: 'COMPLETED',
          assetId: 'asset-1'
        },
        {
          id: 'maint-2',
          type: 'CORRECTIVO',
          status: 'SCHEDULED',
          assetId: 'asset-2'
        }
      ]

      mockPrisma.maintenance.findMany.mockResolvedValue(mockMaintenances)

      const result = await MaintenanceService.getMaintenanceHistory({})

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockMaintenances)
    })

    it('should filter by status', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([])

      await MaintenanceService.getMaintenanceHistory({ status: 'IN_PROGRESS' })

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'IN_PROGRESS' })
        })
      )
    })

    it('should filter by asset', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([])

      await MaintenanceService.getMaintenanceHistory({ assetId: 'asset-1' })

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assetId: 'asset-1' })
        })
      )
    })

    it('should filter by type', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([])

      await MaintenanceService.getMaintenanceHistory({ type: 'PREVENTIVO' })

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PREVENTIVO' })
        })
      )
    })
  })

  describe('completeMaintenance', () => {
    it('should complete maintenance record', async () => {
      const updateData = {
        maintenanceId: 'maint-1',
        completedDate: new Date(),
        notes: 'Work completed successfully'
      }

      const mockMaintenance = {
        id: 'maint-1',
        status: 'IN_PROGRESS',
        type: 'PREVENTIVO',
        assetId: 'asset-1',
        cost: 100,
        asset: {
          id: 'asset-1',
          status: 'IN_REPAIR',
          assignedToId: null
        }
      }

      const mockUpdated = {
        ...mockMaintenance,
        status: 'COMPLETED',
        completedDate: updateData.completedDate
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance)
      mockPrisma.maintenance.update.mockResolvedValue(mockUpdated)

      const result = await MaintenanceService.completeMaintenance(updateData)

      expect(mockPrisma.maintenance.update).toHaveBeenCalled()
      expect(result).toEqual(mockUpdated)
    })
  })

  describe('getMaintenanceById', () => {
    it('should return maintenance record by id', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        assetId: 'asset-1',
        type: 'PREVENTIVO',
        status: 'SCHEDULED'
      }

      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance)

      const result = await MaintenanceService.getMaintenanceById('maint-1')

      expect(mockPrisma.maintenance.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'maint-1' }
        })
      )
      expect(result).toEqual(mockMaintenance)
    })

    it('should return null when maintenance not found', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null)

      const result = await MaintenanceService.getMaintenanceById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('cancelMaintenance', () => {
    it('should cancel a scheduled maintenance', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        status: 'SCHEDULED'
      }

      const mockCancelled = {
        ...mockMaintenance,
        status: 'CANCELLED'
      }

      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance)
      mockPrisma.maintenance.update.mockResolvedValue(mockCancelled)

      const result = await MaintenanceService.cancelMaintenance('maint-1')

      expect(mockPrisma.maintenance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'maint-1' },
          data: { status: 'CANCELLED' }
        })
      )
      expect(result.status).toBe('CANCELLED')
    })

    it('should throw error when cancelling completed maintenance', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        status: 'COMPLETED'
      }

      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance)

      await expect(MaintenanceService.cancelMaintenance('maint-1')).rejects.toThrow(
        'No se puede cancelar un mantenimiento completado'
      )
    })
  })

  describe('startMaintenance', () => {
    it('should start a scheduled maintenance', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        status: 'SCHEDULED'
      }

      const mockStarted = {
        ...mockMaintenance,
        status: 'IN_PROGRESS'
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance)
      mockPrisma.maintenance.update.mockResolvedValue(mockStarted)

      const result = await MaintenanceService.startMaintenance('maint-1')

      expect(result.status).toBe('IN_PROGRESS')
    })

    it('should throw error when starting non-scheduled maintenance', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        status: 'IN_PROGRESS'
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance)

      await expect(MaintenanceService.startMaintenance('maint-1')).rejects.toThrow(
        'Solo se pueden iniciar mantenimientos programados'
      )
    })
  })
})
