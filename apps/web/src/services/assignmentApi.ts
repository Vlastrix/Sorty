import { AssetAssignment, AssignmentStatus } from '@sorty/validators'

const API_BASE_URL = 'http://localhost:4000'

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export interface AssignAssetData {
  assetId: string
  assignedToId: string
  location?: string
  reason?: string
  notes?: string
}

export interface TransferAssetData {
  newAssignedToId: string
  location?: string
  reason?: string
  notes?: string
}

export interface ReturnAssetData {
  notes?: string
}

export const assignmentApi = {
  /**
   * Asignar un activo a un usuario
   */
  async assignAsset(data: AssignAssetData): Promise<AssetAssignment> {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Devolver un activo
   */
  async returnAsset(assetId: string, data?: ReturnAssetData): Promise<AssetAssignment> {
    const response = await fetch(`${API_BASE_URL}/assignments/${assetId}/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {})
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Transferir un activo a otro usuario
   */
  async transferAsset(assetId: string, data: TransferAssetData): Promise<AssetAssignment> {
    const response = await fetch(`${API_BASE_URL}/assignments/${assetId}/transfer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Obtener historial de asignaciones con filtros opcionales
   */
  async getAssignmentHistory(filters?: {
    assetId?: string
    userId?: string
    status?: AssignmentStatus
  }): Promise<AssetAssignment[]> {
    const params = new URLSearchParams()
    if (filters?.assetId) params.append('assetId', filters.assetId)
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.status) params.append('status', filters.status)

    const response = await fetch(`${API_BASE_URL}/assignments?${params.toString()}`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Obtener solo las asignaciones activas
   */
  async getActiveAssignments(): Promise<AssetAssignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments/active`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Obtener una asignación específica por ID
   */
  async getAssignmentById(id: string): Promise<AssetAssignment> {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Obtener historial de asignaciones de un activo específico
   */
  async getAssetAssignmentHistory(assetId: string): Promise<AssetAssignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments/asset/${assetId}`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    return result.data
  },

  /**
   * Obtener historial de asignaciones de un usuario específico
   */
  async getUserAssignmentHistory(userId: string): Promise<AssetAssignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments/user/${userId}`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    return result.data
  }
}
