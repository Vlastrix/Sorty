import { 
  Category, 
  Asset, 
  CreateCategoryInput, 
  CreateAssetInput, 
  AssetFilters, 
  AssetsResponse, 
  AssetStats,
  ApiResponse,
  AssetStatus
} from '../types/assets'

const API_BASE_URL = 'http://localhost:4000'

// Función para obtener el token del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

// Función helper para hacer requests autenticados
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('No hay token de autenticación')
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    ...options.headers as Record<string, string>,
  }

  // Solo añadir Content-Type si hay body
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Error HTTP: ${response.status}`)
  }

  return response.json()
}

export const categoryApi = {
  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    const response: ApiResponse<Category[]> = await authenticatedFetch('/categories')
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener categorías')
    }
    return response.data || []
  },

  // Obtener categoría por ID
  async getById(id: string): Promise<Category> {
    const response: ApiResponse<Category> = await authenticatedFetch(`/categories/${id}`)
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener categoría')
    }
    return response.data!
  },

  // Crear nueva categoría
  async create(data: CreateCategoryInput): Promise<Category> {
    const response: ApiResponse<Category> = await authenticatedFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al crear categoría')
    }
    return response.data!
  },

  // Actualizar categoría
  async update(id: string, data: Partial<CreateCategoryInput>): Promise<Category> {
    const response: ApiResponse<Category> = await authenticatedFetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar categoría')
    }
    return response.data!
  },

  // Eliminar categoría
  async delete(id: string): Promise<void> {
    const response: ApiResponse<{ message: string }> = await authenticatedFetch(`/categories/${id}`, {
      method: 'DELETE',
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar categoría')
    }
  },
}

export const assetApi = {
  // Obtener activos con filtros
  async getAll(filters: AssetFilters = {}): Promise<AssetsResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const queryString = params.toString()
    const url = queryString ? `/assets?${queryString}` : '/assets'
    
    const response: ApiResponse<AssetsResponse> = await authenticatedFetch(url)
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener activos')
    }
    return response.data!
  },

  // Obtener activo por ID
  async getById(id: string): Promise<Asset> {
    const response: ApiResponse<Asset> = await authenticatedFetch(`/assets/${id}`)
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener activo')
    }
    return response.data!
  },

  // Obtener activo por código
  async getByCode(code: string): Promise<Asset> {
    const response: ApiResponse<Asset> = await authenticatedFetch(`/assets/code/${code}`)
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener activo')
    }
    return response.data!
  },

  // Crear nuevo activo
  async create(data: CreateAssetInput): Promise<Asset> {
    const response: ApiResponse<Asset> = await authenticatedFetch('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al crear activo')
    }
    return response.data!
  },

  // Actualizar activo
  async update(id: string, data: Partial<CreateAssetInput>): Promise<Asset> {
    const response: ApiResponse<Asset> = await authenticatedFetch(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar activo')
    }
    return response.data!
  },

  // Cambiar estado del activo
  async changeStatus(id: string, status: AssetStatus): Promise<Asset> {
    const response: ApiResponse<Asset> = await authenticatedFetch(`/assets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al cambiar estado del activo')
    }
    return response.data!
  },

  // Dar de baja un activo (requiere motivo y documento)
  async decommission(id: string, data: { reason: string; documentReference: string; notes?: string }): Promise<Asset> {
    const response: ApiResponse<Asset> = await authenticatedFetch(`/assets/${id}/decommission`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al dar de baja el activo')
    }
    return response.data!
  },

  // Eliminar activo
  async delete(id: string): Promise<void> {
    const response: ApiResponse<{ message: string }> = await authenticatedFetch(`/assets/${id}`, {
      method: 'DELETE',
    })
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar activo')
    }
  },

  // Obtener estadísticas
  async getStats(): Promise<AssetStats> {
    const response: ApiResponse<AssetStats> = await authenticatedFetch('/assets-stats')
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener estadísticas')
    }
    return response.data!
  },
}