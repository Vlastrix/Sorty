import React, { useState, useEffect } from 'react'
import { Category, CreateCategoryInput } from '../types/assets'
import { categoryApi } from '../services/assetApi'
import { ConfirmModal } from './ConfirmModal'
import Icon from '../components/Icon';

interface CategoriesManagerProps {
  onClose: () => void
  onSuccess: () => void
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para crear nueva categoría
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategory, setNewCategory] = useState<CreateCategoryInput>({
    name: '',
    description: '',
    parentId: null,
    defaultAcquisitionCost: undefined,
    defaultUsefulLife: undefined,
    defaultResidualValue: undefined
  })
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryApi.getAll()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await categoryApi.create(newCategory)
      setNewCategory({ 
        name: '', 
        description: '', 
        parentId: null,
        defaultAcquisitionCost: undefined,
        defaultUsefulLife: undefined,
        defaultResidualValue: undefined
      })
      setShowCreateForm(false)
      await loadCategories()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    setCategoryToDelete({ id, name })
    setShowDeleteModal(true)
  }
  
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      await categoryApi.delete(categoryToDelete.id)
      await loadCategories()
      onSuccess()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría')
    } finally {
      setShowDeleteModal(false)
      setCategoryToDelete(null)
    }
  }

  // Organizar categorías en jerarquía
  const organizeCategories = (categories: Category[]) => {
    const mainCategories = categories.filter(cat => !cat.parentId)
    const subcategories = categories.filter(cat => cat.parentId)
    
    return mainCategories.map(main => ({
      ...main,
      subcategories: subcategories.filter(sub => sub.parentId === main.id)
    }))
  }

  const organizedCategories = organizeCategories(categories)

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 animate-fade-in-scale">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            Cargando categorías...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="tags" /> Gestión de Categorías y Subcategorías
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <Icon name="times" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800"><Icon name="times" /> {error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Action Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Icon name="plus" /> Nueva Categoría Principal
            </button>
          </div>

          {/* Create Category Form */}
          {showCreateForm && (
            <div className={`mb-6 p-4 rounded-lg ${newCategory.parentId ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {newCategory.parentId 
                  ? (
                    <>
                      <Icon name="plus" /> Crear Subcategoría para "{categories.find(c => c.id === newCategory.parentId)?.name}"
                    </>
                  )
                  : (
                    <>
                      <Icon name="plus" /> Crear Nueva Categoría Principal
                    </>
                  )
                }
              </h3>
              {newCategory.parentId && (
                <div className="mb-4 p-3 bg-green-100 rounded-md">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Icon name="sitemap" /> Esta será una subcategoría de <strong>"{categories.find(c => c.id === newCategory.parentId)?.name}"</strong>
                  </p>
                </div>
              )}
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: Equipos de Cómputo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría Padre (opcional)
                    </label>
                    <select
                      value={newCategory.parentId || ''}
                      onChange={(e) => setNewCategory(prev => ({ 
                        ...prev, 
                        parentId: e.target.value || null 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!!newCategory.parentId && showCreateForm}
                    >
                      <option value="">-- Categoría Principal --</option>
                      {categories.filter(cat => !cat.parentId).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Solo mostrar valores por defecto para categorías principales */}
                {!newCategory.parentId && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Icon name="dollar-sign" /> Valores por Defecto para Activos
                        <span className="text-xs font-normal text-gray-500">(Opcional - Se heredarán a subcategorías)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Costo de Adquisición
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newCategory.defaultAcquisitionCost ?? ''}
                              onChange={(e) => setNewCategory(prev => ({ 
                                ...prev, 
                                defaultAcquisitionCost: e.target.value ? parseFloat(e.target.value) : undefined 
                              }))}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vida Útil (años)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={newCategory.defaultUsefulLife ?? ''}
                            onChange={(e) => setNewCategory(prev => ({ 
                              ...prev, 
                              defaultUsefulLife: e.target.value ? parseInt(e.target.value) : undefined 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Residual
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newCategory.defaultResidualValue ?? ''}
                              onChange={(e) => setNewCategory(prev => ({ 
                                ...prev, 
                                defaultResidualValue: e.target.value ? parseFloat(e.target.value) : undefined 
                              }))}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Descripción opcional de la categoría"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {newCategory.parentId ? 'Crear Subcategoría' : 'Crear Categoría Principal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewCategory({ 
                        name: '', 
                        description: '', 
                        parentId: null,
                        defaultAcquisitionCost: undefined,
                        defaultUsefulLife: undefined,
                        defaultResidualValue: undefined
                      })
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Tree */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estructura de Categorías</h3>
            
            {organizedCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay categorías creadas</p>
                <p className="text-sm">Crea tu primera categoría usando el botón de arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {organizedCategories.map((mainCategory) => (
                  <div key={mainCategory.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Categoría Principal */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{mainCategory.name}</h4>
                          {mainCategory.description && (
                            <p className="text-sm text-gray-600">{mainCategory.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {mainCategory._count?.assets || 0} activos
                            {/* • {mainCategory.subcategories?.length || 0} subcategorías */}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setNewCategory({ 
                              name: '', 
                              description: '', 
                              parentId: mainCategory.id 
                            })
                            setShowCreateForm(true)
                          }}
                          className="relative group p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                          title="Agregar subcategoría"
                        >
                          <Icon name="plus" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Agregar Subcategoría
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(mainCategory.id, mainCategory.name)}
                          className="relative group p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar categoría"
                        >
                          <Icon name="trash" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Eliminar
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Subcategorías */}
                    {mainCategory.subcategories && mainCategory.subcategories.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {mainCategory.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <div>
                                <span className="text-sm font-medium text-gray-800">
                                  {subcategory.name}
                                </span>
                                {subcategory.description && (
                                  <p className="text-xs text-gray-600">{subcategory.description}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {subcategory._count?.assets || 0} activos
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(subcategory.id, subcategory.name)}
                              className="relative group p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                              title="Eliminar subcategoría"
                            >
                              <Icon name="trash" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Eliminar
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setCategoryToDelete(null)
        }}
        onConfirm={confirmDeleteCategory}
        title="¿Eliminar categoría?"
        message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}