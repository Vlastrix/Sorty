import { Incident, IncidentType, IncidentStatus } from '@sorty/validators';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

interface ReportIncidentData {
  assetId: string;
  type: IncidentType;
  description: string;
  cost?: number;
  notes?: string;
}

interface ResolveIncidentData {
  resolution: string;
  resolvedDate?: string;
  cost?: number;
}

export const incidentApi = {
  // Reportar incidencia
  async reportIncident(data: ReportIncidentData): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al reportar incidencia');
    }

    return response.json();
  },

  // Investigar incidencia
  async investigateIncident(id: string): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/investigate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al investigar incidencia');
    }

    return response.json();
  },

  // Resolver incidencia
  async resolveIncident(id: string, data: ResolveIncidentData): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al resolver incidencia');
    }

    return response.json();
  },

  // Cerrar incidencia
  async closeIncident(id: string): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cerrar incidencia');
    }

    return response.json();
  },

  // Obtener todas las incidencias con filtros
  async getIncidents(filters?: {
    assetId?: string;
    type?: IncidentType;
    status?: IncidentStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (filters?.assetId) params.append('assetId', filters.assetId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(
      `${API_BASE_URL}/incidents?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener incidencias');
    }

    return response.json();
  },

  // Obtener incidencias activas
  async getActiveIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/incidents/active`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener incidencias activas');
    }

    return response.json();
  },

  // Obtener incidencias de un activo
  async getAssetIncidents(assetId: string): Promise<Incident[]> {
    const response = await fetch(
      `${API_BASE_URL}/incidents/asset/${assetId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener incidencias del activo');
    }

    return response.json();
  },

  // Obtener una incidencia por ID
  async getIncident(id: string): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener incidencia');
    }

    return response.json();
  },
};
