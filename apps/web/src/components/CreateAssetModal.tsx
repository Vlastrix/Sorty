import React, { useState, useEffect } from 'react'
import { Asset, Category, AssetStatus, AssetStatusLabels, CreateAssetInput } from '../types/assets'
import Icon from '../components/Icon';
import { Combobox } from './Combobox';

interface CreateAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (assetData: CreateAssetInput) => Promise<void>
  categories: Category[]
  editingAsset?: Asset | null
}

export const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingAsset = null
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  const isEditMode = !!editingAsset

  // Estados del formulario
  const [formData, setFormData] = useState<CreateAssetInput>({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    model: '',
    serialNumber: '',
    acquisitionCost: 0,
    purchaseDate: '',
    supplier: '',
    usefulLife: 1,
    residualValue: 0,
    building: '',
    office: '',
    laboratory: '',
    location: '',
    status: 'AVAILABLE'
  })

  // Cargar marcas disponibles
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('http://localhost:4000/assets-brands', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success) {
          setAvailableBrands(result.data)
        }
      } catch (err) {
        console.error('Error al cargar marcas:', err)
      }
    }

    if (isOpen) {
      fetchBrands()
    }
  }, [isOpen])

  // Auto-completar valores por defecto cuando se selecciona una categoría
  useEffect(() => {
    const fetchCategoryDefaults = async () => {
      if (!formData.categoryId || isEditMode) return
      
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`http://localhost:4000/categories/${formData.categoryId}/defaults`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const result = await response.json()
        
        if (result.success && result.data) {
          const defaults = result.data
          
          // Siempre actualizar con los valores por defecto de la categoría seleccionada
          setFormData(prev => ({
            ...prev,
            acquisitionCost: defaults.defaultAcquisitionCost 
              ? Number(defaults.defaultAcquisitionCost) 
              : 0,
            usefulLife: defaults.defaultUsefulLife 
              ? defaults.defaultUsefulLife 
              : 1,
            residualValue: defaults.defaultResidualValue 
              ? Number(defaults.defaultResidualValue) 
              : 0
          }))
        }
      } catch (err) {
        console.error('Error al cargar valores por defecto:', err)
      }
    }

    fetchCategoryDefaults()
  }, [formData.categoryId, isEditMode])

  // Cargar datos del activo cuando se abre en modo edición
  useEffect(() => {
    if (editingAsset) {
      setFormData({
        code: editingAsset.code,
        name: editingAsset.name,
        description: editingAsset.description || '',
        categoryId: editingAsset.categoryId,
        brand: editingAsset.brand || '',
        model: editingAsset.model || '',
        serialNumber: editingAsset.serialNumber || '',
        acquisitionCost: editingAsset.acquisitionCost,
        purchaseDate: editingAsset.purchaseDate ? new Date(editingAsset.purchaseDate).toISOString().split('T')[0] : '',
        supplier: editingAsset.supplier || '',
        usefulLife: editingAsset.usefulLife,
        residualValue: editingAsset.residualValue || 0,
        building: editingAsset.building || '',
        office: editingAsset.office || '',
        laboratory: editingAsset.laboratory || '',
        location: editingAsset.location || '',
        status: editingAsset.status
      })
    } else {
      // Resetear formulario cuando no hay activo a editar
      // Obtener fecha de hoy en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0]
      
      setFormData({
        code: '',
        name: '',
        description: '',
        categoryId: '',
        brand: '',
        model: '',
        serialNumber: '',
        acquisitionCost: 0,
        purchaseDate: today,
        supplier: '',
        usefulLife: 1,
        residualValue: 0,
        building: '',
        office: '',
        laboratory: '',
        location: '',
        status: 'AVAILABLE'
      })
    }
    setError(null)
  }, [editingAsset, isOpen])

  const handleInputChange = (field: keyof CreateAssetInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Limpiar error cuando el usuario modifique algo
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('<Icon name="file-alt" /> Enviando formulario:', { isEditMode, formData })
    
    // Validaciones básicas
    if (!formData.code.trim()) {
      setError('El código es obligatorio')
      return
    }
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!formData.categoryId) {
      setError('La categoría es obligatoria')
      return
    }
    if (!formData.acquisitionCost || formData.acquisitionCost <= 0) {
      setError('El costo de adquisición debe ser mayor a 0')
      return
    }
    if (!formData.purchaseDate) {
      setError('La fecha de compra es obligatoria')
      return
    }

    try {
      setLoading(true)
      
      // Preparar datos para envío
      const submitData: CreateAssetInput = {
        ...formData,
        // Asegurar que los campos numéricos sean números
        acquisitionCost: Number(formData.acquisitionCost),
        usefulLife: Number(formData.usefulLife || 1),
        residualValue: Number(formData.residualValue || 0),
        // Limpiar campos vacíos
        description: formData.description?.trim() || undefined,
        brand: formData.brand?.trim() || undefined,
        model: formData.model?.trim() || undefined,
        serialNumber: formData.serialNumber?.trim() || undefined,
        supplier: formData.supplier?.trim() || undefined,
        // Campos de ubicación: enviar undefined si están vacíos
        building: formData.building?.trim() || undefined,
        office: formData.office?.trim() || undefined,
        laboratory: formData.laboratory?.trim() || undefined,
        location: formData.location?.trim() || undefined,
      }
      
      // En modo edición, no enviar el código (no se puede cambiar)
      if (isEditMode) {
        delete (submitData as any).code
      }
      
      console.log('<Icon name="boxes" /> Datos a enviar:', submitData)
      await onSubmit(submitData)
      console.log('<Icon name="check" /> Formulario enviado exitosamente')
      
      // Resetear formulario con fecha de hoy
      const today = new Date().toISOString().split('T')[0]
      
      setFormData({
        code: '',
        name: '',
        description: '',
        categoryId: '',
        brand: '',
        model: '',
        serialNumber: '',
        acquisitionCost: 0,
        purchaseDate: today,
        supplier: '',
        usefulLife: 1,
        residualValue: 0,
        building: '',
        office: '',
        laboratory: '',
        location: '',
        status: 'AVAILABLE'
      })
      
      onClose()
    } catch (err) {
      console.error('<Icon name="times" /> Error en el formulario:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(isEditMode ? `Error al actualizar activo: ${errorMessage}` : `Error al crear activo: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-fade-in-scale">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Editar Activo' : 'Nuevo Activo'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              disabled={loading}
            >
              <Icon name="times" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="clipboard" /> Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código <span className="text-red-500">*</span>
                    {isEditMode && <span className="text-xs text-gray-500 ml-2">(No editable)</span>}
                  </label>
                  <input
                    type="text"
                    required={!isEditMode}
                    disabled={isEditMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="ACT-001"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Laptop Dell Inspiron"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción detallada del activo..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as AssetStatus)}
                  >
                    {Object.entries(AssetStatusLabels).map(([status, label]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información Técnica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="wrench" /> Información Técnica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <Combobox
                    value={formData.brand || ''}
                    onChange={(value) => handleInputChange('brand', value)}
                    options={availableBrands}
                    placeholder="Seleccionar o crear marca..."
                    allowCustom={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inspiron 15 3000"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SN123456789"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Datos Contables */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="dollar-sign" /> Datos Contables
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Adquisición <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      value={formData.acquisitionCost || ''}
                      onChange={(e) => handleInputChange('acquisitionCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del proveedor"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vida Útil (años)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                    value={formData.usefulLife || ''}
                    onChange={(e) => handleInputChange('usefulLife', parseInt(e.target.value) || 1)}
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
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      value={formData.residualValue || ''}
                      onChange={(e) => handleInputChange('residualValue', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ubicación Física */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="map-marker" /> Ubicación Física
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edificio
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Edificio Principal, Torre A..."
                    value={formData.building}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oficina
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Oficina 101, Recepción..."
                    value={formData.office}
                    onChange={(e) => handleInputChange('office', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laboratorio
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Lab. Química, Lab. Sistemas..."
                    value={formData.laboratory}
                    onChange={(e) => handleInputChange('laboratory', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación General
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción adicional de ubicación"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400"><Icon name="warning" /></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'Guardando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <Icon name="save" /> Guardar Cambios
                    </>
                  ) : (
                    <>
                      <Icon name="check" /> Crear Activo
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}