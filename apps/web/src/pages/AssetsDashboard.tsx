import React, { useState, useEffect, useMemo } from 'react'
import { Asset, Category, AssetStatus, AssetStatusLabels, AssetStatusColors, CreateAssetInput } from '../types/assets'
import { assetApi, categoryApi } from '../services/assetApi'
import { CategoriesManager } from '../components/CategoriesManager'
import { CreateAssetModal } from '../components/CreateAssetModal'

interface AssetsDashboardProps {}

export const AssetsDashboard: React.FC<AssetsDashboardProps> = () => {
  // Estados principales
  const [allAssets, setAllAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados de filtros (TIEMPO REAL - SIN API CALLS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | ''>('')
  const [buildingTerm, setBuildingTerm] = useState('')

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoriesManager, setShowCategoriesManager] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  // Cargar datos iniciales (UNA SOLA VEZ)
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Cargar categorías
      const categoriesData = await categoryApi.getAll()
      setCategories(categoriesData)
      
      // Cargar todos los assets (paginación automática)
      let allAssets: Asset[] = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const response = await assetApi.getAll({ page, limit: 100 })
        allAssets = [...allAssets, ...response.assets]
        
        // Si recibimos menos de 100, ya no hay más
        hasMore = response.assets.length === 100
        page++
        
        // Límite de seguridad para evitar bucles infinitos
        if (page > 50) break
      }
      
      setAllAssets(allAssets)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // FILTRADO EN TIEMPO REAL usando useMemo (súper eficiente)
  const filteredAssets = useMemo(() => {
    let filtered = [...allAssets]

    // Filtro de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.code.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search) ||
        asset.brand?.toLowerCase().includes(search) ||
        asset.model?.toLowerCase().includes(search) ||
        asset.serialNumber?.toLowerCase().includes(search) ||
        asset.category.name.toLowerCase().includes(search)
      )
    }

    // Filtro de categoría
    if (selectedCategory) {
      filtered = filtered.filter(asset => asset.categoryId === selectedCategory)
    }

    // Filtro de estado
    if (selectedStatus) {
      filtered = filtered.filter(asset => asset.status === selectedStatus)
    }

    // Filtro de edificio
    if (buildingTerm.trim()) {
      const building = buildingTerm.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.building?.toLowerCase().includes(building) ||
        asset.office?.toLowerCase().includes(building) ||
        asset.laboratory?.toLowerCase().includes(building) ||
        asset.location?.toLowerCase().includes(building)
      )
    }

    return filtered
  }, [allAssets, searchTerm, selectedCategory, selectedStatus, buildingTerm])

  // Paginación calculada
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedStatus, buildingTerm])

  // Funciones de manejo (INSTANTÁNEAS)
  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleStatusFilterChange = (value: AssetStatus | '') => {
    setSelectedStatus(value)
  }

  const handleBuildingChange = (value: string) => {
    setBuildingTerm(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Cambiar estado de asset (actualización local inmediata)
  const handleAssetStatusChange = async (assetId: string, newStatus: AssetStatus) => {
    try {
      // Actualizar optimistamente en la UI
      setAllAssets(prev => prev.map(asset => 
        asset.id === assetId ? { ...asset, status: newStatus } : asset
      ))
      
      // Enviar cambio al servidor
      await assetApi.changeStatus(assetId, newStatus)
    } catch (err) {
      // Si falla, revertir el cambio
      setAllAssets(prev => prev.map(asset => 
        asset.id === assetId ? { ...asset, status: asset.status } : asset
      ))
      setError(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  // Crear nuevo asset
  const handleCreateAsset = async (assetData: CreateAssetInput) => {
    try {
      const newAsset = await assetApi.create(assetData)
      setAllAssets(prev => [newAsset, ...prev]) // Agregar al inicio
      setError(null) // Limpiar errores previos
    } catch (err) {
      throw err // Re-lanzar para que el modal lo maneje
    }
  }

  // Editar asset existente
  const handleUpdateAsset = async (assetData: CreateAssetInput) => {
    if (!editingAsset) {
      console.error('No hay activo para editar')
      return
    }
    
    console.log('🔄 Actualizando activo:', editingAsset.id, assetData)
    
    try {
      const updatedAsset = await assetApi.update(editingAsset.id, assetData)
      console.log('✅ Activo actualizado:', updatedAsset)
      
      setAllAssets(prev => prev.map(asset => 
        asset.id === editingAsset.id ? updatedAsset : asset
      ))
      setError(null)
      setEditingAsset(null)
    } catch (err) {
      console.error('❌ Error al actualizar activo:', err)
      throw err // Re-lanzar para que el modal lo maneje
    }
  }

  // Manejar envío del formulario (crear o editar)
  const handleFormSubmit = async (assetData: CreateAssetInput) => {
    if (editingAsset) {
      await handleUpdateAsset(assetData)
    } else {
      await handleCreateAsset(assetData)
    }
  }

  // Eliminar asset
  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('¿Estás seguro de eliminar este activo?')) {
      try {
        await assetApi.delete(assetId)
        setAllAssets(prev => prev.filter(asset => asset.id !== assetId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar activo')
      }
    }
  }

  // Recargar categorías después de gestionar
  const handleCategoriesChange = async () => {
    try {
      const categoriesData = await categoryApi.getAll()
      setCategories(categoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Catálogo de Activos</h1>
          <p className="text-gray-600 mt-1">
            {filteredAssets.length} de {allAssets.length} activos
            {searchTerm && <span className="text-blue-600"> • Buscando: "{searchTerm}"</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoriesManager(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🏷️ Gestionar Categorías
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ➕ Nuevo Activo
          </button>
        </div>
      </div>

      {/* Filtros de búsqueda - TIEMPO REAL */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda instantánea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar
            </label>
            <input
              type="text"
              placeholder="Código, nombre, marca..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Filtro de categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📁 Categoría
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏷️ Estado
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value as AssetStatus)}
            >
              <option value="">Todos los estados</option>
              {Object.entries(AssetStatusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏢 Ubicación
            </label>
            <input
              type="text"
              placeholder="Edificio, oficina..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={buildingTerm}
              onChange={(e) => handleBuildingChange(e.target.value)}
            />
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(searchTerm || selectedCategory || selectedStatus || buildingTerm) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedStatus('')
                setBuildingTerm('')
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              ✖️ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla de activos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {asset.code} - {asset.name}
                      </div>
                      {asset.brand && (
                        <div className="text-sm text-gray-500">
                          {asset.brand} {asset.model}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {asset.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={asset.status}
                      onChange={(e) => handleAssetStatusChange(asset.id, e.target.value as AssetStatus)}
                      className={`text-xs px-2 py-1 rounded-full border-0 ${AssetStatusColors[asset.status]} cursor-pointer`}
                    >
                      {Object.entries(AssetStatusLabels).map(([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {asset.building || 'Sin especificar'}
                    {asset.office && <div className="text-xs text-gray-500">{asset.office}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        👁️ Ver
                      </button>
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar activo"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar activo"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {allAssets.length === 0 ? '📭 No hay activos registrados' : '🔍 No se encontraron activos con esos filtros'}
            </p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAssets.length)} de {filteredAssets.length} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 underline mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestión de categorías */}
      {showCategoriesManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CategoriesManager
              onClose={() => setShowCategoriesManager(false)}
              onSuccess={() => handleCategoriesChange()}
            />
          </div>
        </div>
      )}

      {/* Modal de detalles del activo */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  📦 {selectedAsset.name}
                </h2>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✖️
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Código:</strong> {selectedAsset.code}</div>
                <div><strong>Categoría:</strong> {selectedAsset.category.name}</div>
                <div><strong>Estado:</strong> {AssetStatusLabels[selectedAsset.status]}</div>
                <div><strong>Marca:</strong> {selectedAsset.brand || 'N/A'}</div>
                <div><strong>Modelo:</strong> {selectedAsset.model || 'N/A'}</div>
                <div><strong>Serie:</strong> {selectedAsset.serialNumber || 'N/A'}</div>
                <div><strong>Costo:</strong> ${selectedAsset.acquisitionCost}</div>
                <div><strong>Edificio:</strong> {selectedAsset.building || 'N/A'}</div>
                <div><strong>Oficina:</strong> {selectedAsset.office || 'N/A'}</div>
                <div><strong>Laboratorio:</strong> {selectedAsset.laboratory || 'N/A'}</div>
              </div>
              
              {selectedAsset.description && (
                <div className="mt-4">
                  <strong>Descripción:</strong>
                  <p className="text-gray-700 mt-1">{selectedAsset.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación/edición de activo */}
      <CreateAssetModal
        isOpen={showCreateModal || !!editingAsset}
        onClose={() => {
          setShowCreateModal(false)
          setEditingAsset(null)
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        editingAsset={editingAsset}
      />
    </div>
  )
}