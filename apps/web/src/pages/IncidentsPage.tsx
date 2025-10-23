import { useState, useEffect } from 'react';
import {
  Incident,
  IncidentType,
  IncidentStatus,
  IncidentTypeLabels,
  IncidentStatusLabels,
  canManageAssets,
} from '@sorty/validators';
import { incidentApi } from '../services/incidentApi';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/forms/Button';
import CreateIncidentModal from '../components/CreateIncidentModal';

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resolution, setResolution] = useState('');
  
  // Filtros
  const [filterType, setFilterType] = useState<IncidentType | ''>('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('');

  const canManage = user ? canManageAssets(user.role) : false;

  useEffect(() => {
    loadIncidents();
  }, [filterType, filterStatus]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentApi.getIncidents({
        type: filterType || undefined,
        status: filterStatus || undefined,
      });
      setIncidents(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async (id: string) => {
    if (!confirm('¿Marcar esta incidencia como en investigación?')) return;
    
    try {
      await incidentApi.investigateIncident(id);
      await loadIncidents();
    } catch (err: any) {
      alert(err.message || 'Error al investigar incidencia');
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident || !resolution.trim()) return;

    try {
      await incidentApi.resolveIncident(selectedIncident.id, {
        resolution: resolution.trim(),
      });
      setShowResolveModal(false);
      setResolution('');
      setSelectedIncident(null);
      await loadIncidents();
    } catch (err: any) {
      alert(err.message || 'Error al resolver incidencia');
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('¿Cerrar esta incidencia?')) return;
    
    try {
      await incidentApi.closeIncident(id);
      await loadIncidents();
    } catch (err: any) {
      alert(err.message || 'Error al cerrar incidencia');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.REPORTED:
        return 'bg-yellow-100 text-yellow-800';
      case IncidentStatus.INVESTIGATING:
        return 'bg-blue-100 text-blue-800';
      case IncidentStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case IncidentStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: IncidentType) => {
    switch (type) {
      case IncidentType.DANO:
        return 'bg-orange-100 text-orange-800';
      case IncidentType.PERDIDA:
        return 'bg-purple-100 text-purple-800';
      case IncidentType.ROBO:
        return 'bg-red-100 text-red-800';
      case IncidentType.MAL_FUNCIONAMIENTO:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚠️ Incidencias</h1>
          <p className="text-gray-600 mt-2">
            Gestión de daños, pérdidas, robos y mal funcionamiento
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <span>➕</span>
          Reportar Incidencia
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Incidencia
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as IncidentType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value={IncidentType.DANO}>
                {IncidentTypeLabels[IncidentType.DANO]}
              </option>
              <option value={IncidentType.PERDIDA}>
                {IncidentTypeLabels[IncidentType.PERDIDA]}
              </option>
              <option value={IncidentType.ROBO}>
                {IncidentTypeLabels[IncidentType.ROBO]}
              </option>
              <option value={IncidentType.MAL_FUNCIONAMIENTO}>
                {IncidentTypeLabels[IncidentType.MAL_FUNCIONAMIENTO]}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value={IncidentStatus.REPORTED}>
                {IncidentStatusLabels[IncidentStatus.REPORTED]}
              </option>
              <option value={IncidentStatus.INVESTIGATING}>
                {IncidentStatusLabels[IncidentStatus.INVESTIGATING]}
              </option>
              <option value={IncidentStatus.RESOLVED}>
                {IncidentStatusLabels[IncidentStatus.RESOLVED]}
              </option>
              <option value={IncidentStatus.CLOSED}>
                {IncidentStatusLabels[IncidentStatus.CLOSED]}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {incidents.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">📊 Resumen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-2xl font-bold text-yellow-600">
                {incidents.filter((i) => i.status === IncidentStatus.REPORTED).length}
              </p>
              <p className="text-sm text-gray-600">Reportados</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">
                {
                  incidents.filter((i) => i.status === IncidentStatus.INVESTIGATING)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">En Investigación</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">
                {incidents.filter((i) => i.status === IncidentStatus.RESOLVED).length}
              </p>
              <p className="text-sm text-gray-600">Resueltos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-600">
                {incidents.filter((i) => i.status === IncidentStatus.CLOSED).length}
              </p>
              <p className="text-sm text-gray-600">Cerrados</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de incidencias */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando incidencias...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay incidencias registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Activo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reportado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Costo
                  </th>
                  {canManage && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {incident.asset?.name || 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {incident.asset?.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                          incident.type
                        )}`}
                      >
                        {IncidentTypeLabels[incident.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">{incident.description}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>{formatDate(incident.reportedDate)}</div>
                      <div className="text-gray-500 text-xs">
                        {incident.reportedBy?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {IncidentStatusLabels[incident.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(incident.cost)}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {incident.status === IncidentStatus.REPORTED && (
                            <Button
                              onClick={() => handleInvestigate(incident.id)}
                              className="text-xs"
                            >
                              🔍 Investigar
                            </Button>
                          )}
                          {incident.status === IncidentStatus.INVESTIGATING && (
                            <Button
                              onClick={() => {
                                setSelectedIncident(incident);
                                setShowResolveModal(true);
                              }}
                              className="text-xs"
                            >
                              ✅ Resolver
                            </Button>
                          )}
                          {incident.status === IncidentStatus.RESOLVED && (
                            <Button
                              onClick={() => handleClose(incident.id)}
                              className="text-xs"
                            >
                              🔒 Cerrar
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para resolver incidencia */}
      {showResolveModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Resolver Incidencia</h3>
            <p className="text-sm text-gray-600 mb-4">
              Activo: <strong>{selectedIncident.asset?.name}</strong>
            </p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Describe cómo se resolvió la incidencia..."
              required
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolution('');
                  setSelectedIncident(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleResolve} disabled={!resolution.trim()}>
                Resolver
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear incidencia */}
      {showCreateModal && (
        <CreateIncidentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadIncidents();
          }}
        />
      )}
    </div>
  );
}
