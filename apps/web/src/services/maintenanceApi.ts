import { Maintenance, MaintenanceType, MaintenanceStatus } from '@sorty/validators';

const API_BASE_URL = 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

interface ScheduleMaintenanceData {
  assetId: string;
  type: MaintenanceType;
  scheduledDate: string;
  description: string;
  performedBy?: string;
  cost?: number;
  notes?: string;
}

interface CompleteMaintenanceData {
  completedDate?: string;
  cost?: number;
  notes?: string;
}

export const maintenanceApi = {
  // Programar mantenimiento
  async scheduleMaintenance(data: ScheduleMaintenanceData): Promise<Maintenance> {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al programar mantenimiento');
    }

    return response.json();
  },

  // Iniciar mantenimiento
  async startMaintenance(id: string): Promise<Maintenance> {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar mantenimiento');
    }

    return response.json();
  },

  // Completar mantenimiento
  async completeMaintenance(id: string, data: CompleteMaintenanceData): Promise<Maintenance> {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al completar mantenimiento');
    }

    return response.json();
  },

  // Cancelar mantenimiento
  async cancelMaintenance(id: string): Promise<Maintenance> {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cancelar mantenimiento');
    }

    return response.json();
  },

  // Obtener todos los mantenimientos con filtros
  async getMaintenances(filters?: {
    assetId?: string;
    type?: MaintenanceType;
    status?: MaintenanceStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Maintenance[]> {
    const params = new URLSearchParams();
    if (filters?.assetId) params.append('assetId', filters.assetId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_BASE_URL}/maintenance?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener mantenimientos');
    }

    return response.json();
  },

  // Obtener próximos mantenimientos
  async getUpcomingMaintenances(days?: number): Promise<Maintenance[]> {
    const params = days ? `?days=${days}` : '';
    const response = await fetch(
      `${API_BASE_URL}/maintenance/upcoming${params}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener próximos mantenimientos');
    }

    return response.json();
  },

  // Obtener mantenimientos de un activo
  async getAssetMaintenances(assetId: string): Promise<Maintenance[]> {
    const response = await fetch(
      `${API_BASE_URL}/maintenance/asset/${assetId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener mantenimientos del activo');
    }

    return response.json();
  },

  // Obtener un mantenimiento por ID
  async getMaintenance(id: string): Promise<Maintenance> {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener mantenimiento');
    }

    return response.json();
  },
};
