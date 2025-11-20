import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as IncidentService from '@/incidents/incidentService'
import { mockPrisma } from '../setup'

describe('IncidentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('reportIncident', () => {
    it('should create a new incident', async () => {
      const incidentData = {
        assetId: 'asset-1',
        type: 'DANO' as const,
        description: 'Screen cracked',
        reportedById: 'user-1',
        cost: 200
      }

      const mockIncident = {
        id: 'inc-1',
        ...incidentData,
        status: 'REPORTED',
        reportedDate: new Date(),
        createdAt: new Date()
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'asset-1', status: 'IN_USE' })
      mockPrisma.incident.create.mockResolvedValue(mockIncident)

      const result = await IncidentService.reportIncident(incidentData)

      expect(mockPrisma.incident.create).toHaveBeenCalled()
      expect(result).toEqual(mockIncident)
    })
  })

  describe('getIncidentHistory', () => {
    it('should return all incidents', async () => {
      const mockIncidents = [
        {
          id: 'inc-1',
          type: 'DANO',
          status: 'REPORTED',
          assetId: 'asset-1'
        },
        {
          id: 'inc-2',
          type: 'ROBO',
          status: 'INVESTIGATING',
          assetId: 'asset-2'
        }
      ]

      mockPrisma.incident.findMany.mockResolvedValue(mockIncidents)

      const result = await IncidentService.getIncidentHistory({})

      expect(mockPrisma.incident.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockIncidents)
    })

    it('should filter by status', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([])

      await IncidentService.getIncidentHistory({ status: 'RESOLVED' })

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'RESOLVED' })
        })
      )
    })

    it('should filter by type', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([])

      await IncidentService.getIncidentHistory({ type: 'PERDIDA' })

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PERDIDA' })
        })
      )
    })

    it('should filter by asset', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([])

      await IncidentService.getIncidentHistory({ assetId: 'asset-1' })

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assetId: 'asset-1' })
        })
      )
    })
  })

  describe('resolveIncident', () => {
    it('should resolve incident record', async () => {
      const resolveData = {
        incidentId: 'inc-1',
        resolution: 'Issue resolved',
        resolvedDate: new Date()
      }

      const mockIncident = {
        id: 'inc-1',
        status: 'INVESTIGATING',
        type: 'DANO',
        assetId: 'asset-1',
        cost: 100,
        asset: {
          id: 'asset-1',
          status: 'IN_REPAIR',
          assignedToId: null
        }
      }

      const mockUpdated = {
        ...mockIncident,
        status: 'RESOLVED',
        resolution: resolveData.resolution,
        resolvedDate: resolveData.resolvedDate
      }

      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma))
      mockPrisma.incident.findUnique.mockResolvedValue(mockIncident)
      mockPrisma.incident.update.mockResolvedValue(mockUpdated)

      const result = await IncidentService.resolveIncident(resolveData)

      expect(mockPrisma.incident.update).toHaveBeenCalled()
      expect(result).toEqual(mockUpdated)
    })
  })

  describe('getIncidentById', () => {
    it('should return incident by id', async () => {
      const mockIncident = {
        id: 'inc-1',
        type: 'ROBO',
        status: 'CLOSED'
      }

      mockPrisma.incident.findUnique.mockResolvedValue(mockIncident)

      const result = await IncidentService.getIncidentById('inc-1')

      expect(mockPrisma.incident.findUnique).toHaveBeenCalledWith({
        where: { id: 'inc-1' },
        include: expect.any(Object)
      })
      expect(result).toEqual(mockIncident)
    })
  })

  describe('getIncidentsByAsset', () => {
    it('should return incidents for specific asset', async () => {
      const mockIncidents = [
        { id: 'inc-1', assetId: 'asset-1', type: 'DANO', status: 'RESOLVED' },
        { id: 'inc-2', assetId: 'asset-1', type: 'PERDIDA', status: 'INVESTIGATING' }
      ]

      mockPrisma.incident.findMany.mockResolvedValue(mockIncidents)

      const result = await IncidentService.getIncidentsByAsset('asset-1')

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assetId: 'asset-1' }
        })
      )
      expect(result).toEqual(mockIncidents)
    })
  })

  describe('closeIncident', () => {
    it('should close a resolved incident', async () => {
      const mockIncident = {
        id: 'inc-1',
        status: 'RESOLVED'
      }

      const mockUpdated = {
        ...mockIncident,
        status: 'CLOSED'
      }

      mockPrisma.incident.findUnique.mockResolvedValue(mockIncident)
      mockPrisma.incident.update.mockResolvedValue(mockUpdated)

      const result = await IncidentService.closeIncident('inc-1')

      expect(mockPrisma.incident.update).toHaveBeenCalled()
      expect(result.status).toBe('CLOSED')
    })
  })
})
