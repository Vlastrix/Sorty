import { AssetMovement, MovementType, MovementSubtype } from '@sorty/validators';

const API_BASE_URL = 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  console.log('🔑 movementApi - Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

interface RegisterMovementData {
  assetId: string;
  movementType: MovementSubtype;
  description: string;
  cost?: number;
  quantity?: number;
  date?: string;
  notes?: string;
}

export const movementApi = {
  // Registrar entrada de activo
  async registerEntry(data: RegisterMovementData): Promise<AssetMovement> {
    const response = await fetch(`${API_BASE_URL}/movements/entry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar entrada');
    }

    return response.json();
  },

  // Registrar salida de activo
  async registerExit(data: RegisterMovementData): Promise<AssetMovement> {
    const response = await fetch(`${API_BASE_URL}/movements/exit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar salida');
    }

    return response.json();
  },

  // Obtener todos los movimientos con filtros
  async getMovements(filters?: {
    assetId?: string;
    type?: MovementType;
    movementType?: MovementSubtype;
    startDate?: string;
    endDate?: string;
  }): Promise<AssetMovement[]> {
    const params = new URLSearchParams();
    if (filters?.assetId) params.append('assetId', filters.assetId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.movementType) params.append('movementType', filters.movementType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_BASE_URL}/movements?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener movimientos');
    }

    return response.json();
  },

  // Obtener movimientos de un activo
  async getAssetMovements(assetId: string): Promise<AssetMovement[]> {
    const response = await fetch(
      `${API_BASE_URL}/movements/asset/${assetId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener movimientos del activo');
    }

    return response.json();
  },

  // Obtener un movimiento por ID
  async getMovement(id: string): Promise<AssetMovement> {
    const response = await fetch(`${API_BASE_URL}/movements/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener movimiento');
    }

    return response.json();
  },
};
