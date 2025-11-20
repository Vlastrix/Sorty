import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AssignmentService } from '@/assignments/assignmentService'
import { mockPrisma } from '../setup'

describe('AssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('assignAsset', () => {
    it('should create a new assignment successfully', async () => {
      const assignmentData = {
        assetId: 'asset-1',
        assignedToId: 'user-1',
        assignedById: 'admin-1',
        location: 'Office 101',
        reason: 'Work assignment'
      }

      const mockAsset = {
        id: 'asset-1',
        status: 'AVAILABLE',
        assignedToId: null
      }

      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        name: 'Test User',
        isActive: true
      }

      const mockCreatedAssignment = {
        id: 'assign-1',
        ...assignmentData,
        status: 'ACTIVE',
        assignedAt: new Date(),
        createdAt: new Date()
      }

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.$transaction.mockResolvedValue([mockCreatedAssignment, mockAsset, {}])

      const result = await AssignmentService.assignAsset(assignmentData)

      expect(mockPrisma.asset.findUnique).toHaveBeenCalled()
      expect(mockPrisma.user.findUnique).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedAssignment)
    })

    it('should throw error when asset not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null)

      await expect(
        AssignmentService.assignAsset({
          assetId: 'nonexistent',
          assignedToId: 'user-1',
          assignedById: 'admin-1',
          location: 'Office'
        })
      ).rejects.toThrow('Activo no encontrado')
    })

    it('should throw error when asset has active assignment', async () => {
      const mockAsset = {
        id: 'asset-1',
        status: 'IN_USE',
        assignedToId: 'another-user'
      }

      const mockActiveAssignment = {
        id: 'existing',
        status: 'ACTIVE'
      }

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(mockActiveAssignment)

      await expect(
        AssignmentService.assignAsset({
          assetId: 'asset-1',
          assignedToId: 'user-1',
          assignedById: 'admin-1',
          location: 'Office'
        })
      ).rejects.toThrow('El activo ya tiene una asignación activa')
    })
  })

  describe('getAssignmentHistory', () => {
    it('should return all assignments', async () => {
      const mockAssignments = [
        {
          id: 'assign-1',
          assetId: 'asset-1',
          assignedToId: 'user-1',
          status: 'ACTIVE'
        },
        {
          id: 'assign-2',
          assetId: 'asset-2',
          assignedToId: 'user-2',
          status: 'RETURNED'
        }
      ]

      mockPrisma.assetAssignment.findMany.mockResolvedValue(mockAssignments)

      const result = await AssignmentService.getAssignmentHistory({})

      expect(mockPrisma.assetAssignment.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockAssignments)
    })

    it('should filter by status', async () => {
      mockPrisma.assetAssignment.findMany.mockResolvedValue([])

      await AssignmentService.getAssignmentHistory({ status: 'ACTIVE' })

      expect(mockPrisma.assetAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' }
        })
      )
    })

    it('should filter by assetId', async () => {
      mockPrisma.assetAssignment.findMany.mockResolvedValue([])

      await AssignmentService.getAssignmentHistory({ assetId: 'asset-1' })

      expect(mockPrisma.assetAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assetId: 'asset-1' }
        })
      )
    })
  })

  describe('returnAsset', () => {
    it('should return an assignment successfully', async () => {
      const mockAssignment = {
        id: 'assign-1',
        assetId: 'asset-1',
        status: 'ACTIVE',
        assignedTo: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com'
        }
      }

      const mockUpdatedAssignment = {
        ...mockAssignment,
        status: 'RETURNED',
        returnedAt: new Date()
      }

      mockPrisma.assetAssignment.findFirst.mockResolvedValue(mockAssignment)
      mockPrisma.$transaction.mockResolvedValue([mockUpdatedAssignment, {}, {}])

      const result = await AssignmentService.returnAsset({
        assetId: 'asset-1',
        userId: 'user-1',
        notes: 'Good condition'
      })

      expect(mockPrisma.assetAssignment.findFirst).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedAssignment)
    })

    it('should throw error when no active assignment found', async () => {
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(null)

      await expect(
        AssignmentService.returnAsset({
          assetId: 'nonexistent',
          userId: 'user-1'
        })
      ).rejects.toThrow('No hay una asignación activa para este activo')
    })
  })

  describe('assignAsset edge cases', () => {
    it('should throw error when user is inactive', async () => {
      const assignmentData = {
        assetId: 'asset-1',
        assignedToId: 'user-inactive',
        assignedById: 'admin-1',
        reason: 'Assignment test'
      }

      const mockAsset = {
        id: 'asset-1',
        code: 'AST-001',
        assignedTo: null
      }

      const mockInactiveUser = {
        id: 'user-inactive',
        email: 'inactive@test.com',
        isActive: false
      }

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue(mockInactiveUser)

      await expect(AssignmentService.assignAsset(assignmentData)).rejects.toThrow(
        'El usuario está inactivo y no puede recibir asignaciones'
      )
    })

    it('should throw error when user not found for assignment', async () => {
      const assignmentData = {
        assetId: 'asset-1',
        assignedToId: 'user-nonexistent',
        assignedById: 'admin-1'
      }

      const mockAsset = {
        id: 'asset-1',
        code: 'AST-001'
      }

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(null)
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(AssignmentService.assignAsset(assignmentData)).rejects.toThrow('Usuario no encontrado')
    })
  })

  describe('transferAsset', () => {
    it('should transfer asset to new user', async () => {
      const transferData = {
        assetId: 'asset-1',
        newAssignedToId: 'user-2',
        assignedById: 'admin-1',
        reason: 'Transfer test'
      }

      const mockActiveAssignment = {
        id: 'assign-1',
        assetId: 'asset-1',
        assignedToId: 'user-1',
        status: 'ACTIVE',
        asset: { id: 'asset-1', code: 'AST-001' },
        assignedTo: { id: 'user-1', name: 'User 1' }
      }

      const mockNewUser = {
        id: 'user-2',
        email: 'user2@test.com',
        isActive: true
      }

      mockPrisma.assetAssignment.findFirst.mockResolvedValue(mockActiveAssignment)
      mockPrisma.user.findUnique.mockResolvedValue(mockNewUser)
      mockPrisma.$transaction.mockResolvedValue([{}, { id: 'assign-2' }, {}, {}])

      const result = await AssignmentService.transferAsset(transferData)

      expect(mockPrisma.assetAssignment.findFirst).toHaveBeenCalled()
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-2' }
      })
      expect(result).toBeDefined()
    })

    it('should throw error when no active assignment for transfer', async () => {
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(null)

      await expect(
        AssignmentService.transferAsset({
          assetId: 'asset-1',
          newAssignedToId: 'user-2',
          assignedById: 'admin-1'
        })
      ).rejects.toThrow('No hay una asignación activa')
    })

    it('should throw error when new user is same as current', async () => {
      const mockActiveAssignment = {
        id: 'assign-1',
        assetId: 'asset-1',
        assignedToId: 'user-1',
        status: 'ACTIVE'
      }

      const mockUser = {
        id: 'user-1',
        isActive: true
      }

      mockPrisma.assetAssignment.findFirst.mockResolvedValue(mockActiveAssignment)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      await expect(
        AssignmentService.transferAsset({
          assetId: 'asset-1',
          newAssignedToId: 'user-1',
          assignedById: 'admin-1'
        })
      ).rejects.toThrow('El activo ya está asignado a este usuario')
    })
  })

  describe('getActiveAssignments', () => {
    it('should return only active assignments', async () => {
      const mockAssignments = [
        { id: 'assign-1', status: 'ACTIVE', assetId: 'asset-1' },
        { id: 'assign-2', status: 'ACTIVE', assetId: 'asset-2' }
      ]

      mockPrisma.assetAssignment.findMany.mockResolvedValue(mockAssignments)

      const result = await AssignmentService.getActiveAssignments()

      expect(mockPrisma.assetAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' }
        })
      )
      expect(result).toEqual(mockAssignments)
    })
  })

  describe('getAssignmentById', () => {
    it('should return assignment by id', async () => {
      const mockAssignment = {
        id: 'assign-1',
        assetId: 'asset-1',
        assignedToId: 'user-1',
        status: 'ACTIVE'
      }

      mockPrisma.assetAssignment.findUnique.mockResolvedValue(mockAssignment)

      const result = await AssignmentService.getAssignmentById('assign-1')

      expect(mockPrisma.assetAssignment.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'assign-1' }
        })
      )
      expect(result).toEqual(mockAssignment)
    })
  })
})
