import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AssetService } from '@/assets/assetService'
import { mockPrisma } from '../setup'

describe('AssetService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAssets', () => {
    it('should return paginated assets', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          code: 'AST-001',
          name: 'Laptop Dell',
          status: 'AVAILABLE',
          categoryId: 'cat-1'
        }
      ]

      mockPrisma.asset.findMany.mockResolvedValue(mockAssets)
      mockPrisma.asset.count.mockResolvedValue(1)

      const result = await AssetService.getAssets({}, 'user-id', 'ADMIN')

      expect(mockPrisma.asset.findMany).toHaveBeenCalled()
      expect(result.assets).toEqual(mockAssets)
      expect(result.pagination.total).toBe(1)
    })

    it('should filter assets by status', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([])
      mockPrisma.asset.count.mockResolvedValue(0)

      await AssetService.getAssets({ status: 'IN_USE' }, 'user-id', 'ADMIN')

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'IN_USE' })
        })
      )
    })

    it('should filter assets by category', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([])
      mockPrisma.asset.count.mockResolvedValue(0)

      await AssetService.getAssets({ categoryId: 'cat-1' }, 'user-id', 'ADMIN')

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat-1' })
        })
      )
    })
  })

  describe('getAssetById', () => {
    it('should return asset by id for admin', async () => {
      const mockAsset = {
        id: 'asset-1',
        code: 'AST-001',
        name: 'Laptop',
        status: 'AVAILABLE'
      }

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)

      const result = await AssetService.getAssetById('asset-1', 'user-id', 'ADMIN')

      expect(result).toEqual(mockAsset)
    })

    it('should throw error when asset not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null)

      await expect(
        AssetService.getAssetById('nonexistent', 'user-id', 'ADMIN')
      ).rejects.toThrow('Activo no encontrado')
    })
  })

  describe('createAsset', () => {
    it('should create a new asset', async () => {
      const assetData = {
        code: 'AST-002',
        name: 'New Laptop',
        categoryId: 'cat-1',
        status: 'AVAILABLE' as const,
        acquisitionCost: 1000,
        usefulLife: 5
      }

      const mockCreatedAsset = {
        id: 'asset-new',
        ...assetData,
        createdById: 'user-id'
      }

      mockPrisma.asset.findFirst.mockResolvedValue(null) // No existe
      mockPrisma.asset.create.mockResolvedValue(mockCreatedAsset)

      const result = await AssetService.createAsset(assetData, 'user-id')

      expect(mockPrisma.asset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...assetData,
          createdById: 'user-id'
        }),
        include: expect.any(Object)
      })
      expect(result).toEqual(mockCreatedAsset)
    })

    it('should throw error when code already exists', async () => {
      const assetData = {
        code: 'AST-EXISTS',
        name: 'Duplicate',
        categoryId: 'cat-1',
        status: 'AVAILABLE' as const
      }

      mockPrisma.asset.findUnique.mockResolvedValue({ id: 'existing', code: 'AST-EXISTS' })

      await expect(AssetService.createAsset(assetData, 'user-id')).rejects.toThrow(
        'Ya existe un activo con el código'
      )
    })
  })

  describe('updateAsset', () => {
    it('should update an existing asset', async () => {
      const updateData = {
        name: 'Updated Name',
        status: 'IN_USE' as const
      }

      const mockUpdatedAsset = {
        id: 'asset-1',
        code: 'AST-001',
        ...updateData
      }

      mockPrisma.asset.update.mockResolvedValue(mockUpdatedAsset)

      const result = await AssetService.updateAsset('asset-1', updateData)

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'asset-1' },
        data: updateData,
        include: expect.any(Object)
      })
      expect(result).toEqual(mockUpdatedAsset)
    })
  })

  describe('deleteAsset', () => {
    it('should delete an asset', async () => {
      const mockAsset = {
        id: 'asset-1',
        code: 'AST-001',
        name: 'To Delete'
      }

      mockPrisma.asset.delete.mockResolvedValue(mockAsset)

      const result = await AssetService.deleteAsset('asset-1')

      expect(mockPrisma.asset.delete).toHaveBeenCalledWith({
        where: { id: 'asset-1' }
      })
      expect(result.message).toContain('eliminado correctamente')
    })
  })

  describe('getAssetStats', () => {
    it('should return asset statistics', async () => {
      const mockRecentAssets = [
        { id: 'asset-1', name: 'Asset 1', code: 'AST-001' }
      ]
      
      mockPrisma.asset.count.mockResolvedValue(100)
      mockPrisma.asset.findMany.mockResolvedValue(mockRecentAssets)

      const result = await AssetService.getAssetStats()

      expect(result).toBeDefined()
      expect(result.total).toBe(100)
      expect(result.recentAssets).toEqual(mockRecentAssets)
    })
  })

  describe('getAssetByCode', () => {
    it('should return asset by code', async () => {
      const mockAsset = {
        id: 'asset-1',
        code: 'AST-001',
        name: 'Test Asset'
      }

      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset)

      const result = await AssetService.getAssetByCode('AST-001')

      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'AST-001' }
        })
      )
      expect(result).toEqual(mockAsset)
    })
  })

  describe('assignAsset', () => {
    it('should assign asset to user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        isActive: true
      }

      const mockAsset = {
        id: 'asset-1',
        code: 'AST-001',
        assignedToId: 'user-1',
        category: { id: 'cat-1', name: 'Category' },
        assignedTo: mockUser
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.asset.update.mockResolvedValue(mockAsset)

      const result = await AssetService.assignAsset('asset-1', 'user-1')

      expect(mockPrisma.asset.update).toHaveBeenCalled()
      expect(result).toEqual(mockAsset)
    })

    it('should throw error when user is inactive', async () => {
      const mockUser = {
        id: 'user-1',
        isActive: false
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      await expect(AssetService.assignAsset('asset-1', 'user-1')).rejects.toThrow(
        'El usuario está desactivado'
      )
    })
  })
})
