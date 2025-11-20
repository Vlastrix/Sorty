import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CategoryService } from '@/assets/categoryService'
import { mockPrisma } from '../setup'

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllCategories', () => {
    it('should return all categories with subcategories', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Electronics',
          description: 'Electronic devices',
          parentId: null,
          subcategories: [
            { id: 'sub-1', name: 'Laptops', description: 'Laptop computers', parentId: 'cat-1' }
          ]
        }
      ]

      mockPrisma.category.findMany.mockResolvedValue(mockCategories)

      const result = await CategoryService.getAllCategories()

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { assets: true }
          }
        },
        orderBy: { name: 'asc' }
      })
      expect(result).toEqual(mockCategories)
    })

    it('should handle empty categories list', async () => {
      mockPrisma.category.findMany.mockResolvedValue([])

      const result = await CategoryService.getAllCategories()

      expect(result).toEqual([])
    })

    it('should handle database errors', async () => {
      mockPrisma.category.findMany.mockRejectedValue(new Error('Database error'))

      await expect(CategoryService.getAllCategories()).rejects.toThrow('Database error')
    })
  })

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        description: 'Electronic devices',
        parentId: null
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      const result = await CategoryService.getCategoryById('cat-1')

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cat-1' },
          include: expect.any(Object)
        })
      )
      expect(result).toEqual(mockCategory)
    })

    it('should throw error when category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      await expect(CategoryService.getCategoryById('nonexistent')).rejects.toThrow('Categoría no encontrada')
    })
  })

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'A new category'
      }

      const mockCreatedCategory = {
        id: 'cat-new',
        ...categoryData,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory)

      const result = await CategoryService.createCategory(categoryData)

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: categoryData,
        include: {
          _count: {
            select: { assets: true }
          }
        }
      })
      expect(result).toEqual(mockCreatedCategory)
    })

    it('should create category with parentId', async () => {
      const categoryData = {
        name: 'Subcategory',
        description: 'A subcategory',
        parentId: 'parent-id'
      }

      mockPrisma.category.create.mockResolvedValue({ id: 'sub-new', ...categoryData })

      await CategoryService.createCategory(categoryData)

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: categoryData,
        include: {
          _count: {
            select: { assets: true }
          }
        }
      })
    })
  })

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description'
      }

      const mockUpdatedCategory = {
        id: 'cat-1',
        ...updateData,
        parentId: null
      }

      mockPrisma.category.update.mockResolvedValue(mockUpdatedCategory)

      const result = await CategoryService.updateCategory('cat-1', updateData)

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: updateData,
        include: {
          _count: {
            select: { assets: true }
          }
        }
      })
      expect(result).toEqual(mockUpdatedCategory)
    })

    it('should handle update errors', async () => {
      mockPrisma.category.update.mockRejectedValue(new Error('Category not found'))

      await expect(
        CategoryService.updateCategory('nonexistent', { name: 'Test' })
      ).rejects.toThrow('Category not found')
    })
  })

  describe('deleteCategory', () => {
    it('should delete category without subcategories', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'To Delete',
        _count: { subcategories: 0 }
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
      mockPrisma.category.delete.mockResolvedValue(mockCategory)

      const result = await CategoryService.deleteCategory('cat-1')

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' }
      })
      expect(result.message).toContain('eliminada correctamente')
    })

    it('should not delete category with subcategories', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Parent Category',
        _count: { 
          assets: 0,
          subcategories: 2 
        },
        subcategories: [
          { id: 'sub-1', name: 'Sub 1', _count: { assets: 0 } },
          { id: 'sub-2', name: 'Sub 2', _count: { assets: 1 } }
        ]
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      await expect(CategoryService.deleteCategory('cat-1')).rejects.toThrow(
        'tiene subcategorías con activos'
      )
      expect(mockPrisma.category.delete).not.toHaveBeenCalled()
    })

    it('should throw error when category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      await expect(CategoryService.deleteCategory('nonexistent')).rejects.toThrow('Categoría no encontrada')
    })
  })
})
