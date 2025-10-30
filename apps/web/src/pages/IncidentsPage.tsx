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
import { ConfirmModal } from '../components/ConfirmModal';
import { useNotification } from '../hooks/useNotification';
import Icon from '../components/Icon';

export default function IncidentsPage() {
  const { user } = useAuth();
  const { showNotification, NotificationContainer } = useNotification();
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

  // Estados para modales de confirmación
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    type: 'investigate' | 'close';
    incidentId: string;
    incidentName: string;
  }>({
    show: false,
    type: 'investigate',
    incidentId: '',
    incidentName: '',
  });

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
      const errorMsg = err.message || 'Error al cargar incidencias';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async (id: string) => {
    try {
      await incidentApi.investigateIncident(id);
      await loadIncidents();
      showNotification('Incidencia marcada como en investigación', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al investigar incidencia', 'error');
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident || !resolution.trim()) {
      showNotification('Por favor ingresa una resolución', 'warning');
      return;
    }

    try {
      await incidentApi.resolveIncident(selectedIncident.id, {
        resolution: resolution.trim(),
      });
      setShowResolveModal(false);
      setResolution('');
      setSelectedIncident(null);
      await loadIncidents();
      showNotification('Incidencia resuelta exitosamente', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al resolver incidencia', 'error');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await incidentApi.closeIncident(id);
      await loadIncidents();
      showNotification('Incidencia cerrada exitosamente', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al cerrar incidencia', 'error');
    }
  };

  const openConfirmModal = (type: 'investigate' | 'close', incident: Incident) => {
    setConfirmAction({
      show: true,
      type,
      incidentId: incident.id,
      incidentName: incident.asset?.name || incident.description,
    });
  };

  const handleConfirmAction = async () => {
    const { type, incidentId } = confirmAction;
    
    switch (type) {
      case 'investigate':
        await handleInvestigate(incidentId);
        break;
      case 'close':
        await handleClose(incidentId);
        break;
    }
    
    setConfirmAction({ show: false, type: 'investigate', incidentId: '', incidentName: '' });
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
      <NotificationContainer />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"><Icon name="warning" /> Incidencias</h1>
          <p className="text-gray-600 mt-2">
            Gestión de daños, pérdidas, robos y mal funcionamiento
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <span><Icon name="plus" /></span>
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
          <h3 className="text-lg font-semibold mb-3"><Icon name="chart-bar" /> Resumen</h3>
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
                        <div className="flex gap-2 items-center">
                          {incident.status === IncidentStatus.REPORTED && (
                            <button
                              onClick={() => openConfirmModal('investigate', incident)}
                              className="relative group p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                              title="Investigar incidencia"
                            >
                              <Icon name="search" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Investigar
                              </span>
                            </button>
                          )}
                          {incident.status === IncidentStatus.INVESTIGATING && (
                            <button
                              onClick={() => {
                                setSelectedIncident(incident);
                                setShowResolveModal(true);
                              }}
                              className="relative group p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                              title="Resolver incidencia"
                            >
                              <Icon name="check" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Resolver
                              </span>
                            </button>
                          )}
                          {incident.status === IncidentStatus.RESOLVED && (
                            <button
                              onClick={() => openConfirmModal('close', incident)}
                              className="relative group p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                              title="Cerrar incidencia"
                            >
                              <Icon name="times" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Cerrar
                              </span>
                            </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in-scale">
            <h3 className="text-xl font-bold mb-4 text-gray-900"><Icon name="check" /> Resolver Incidencia</h3>
            <p className="text-sm text-gray-600 mb-4">
              Activo: <strong>{selectedIncident.asset?.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolución <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe cómo se resolvió la incidencia..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolution('');
                  setSelectedIncident(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolver
              </button>
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
            showNotification('Incidencia reportada exitosamente', 'success');
          }}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmAction.show}
        onClose={() => setConfirmAction({ show: false, type: 'investigate', incidentId: '', incidentName: '' })}
        onConfirm={handleConfirmAction}
        title={
          confirmAction.type === 'investigate'
            ? 'Investigar Incidencia'
            : 'Cerrar Incidencia'
        }
        message={
          confirmAction.type === 'investigate'
            ? `¿Estás seguro de que deseas marcar como "En Investigación" la incidencia de "${confirmAction.incidentName}"?`
            : `¿Estás seguro de que deseas cerrar la incidencia de "${confirmAction.incidentName}"?`
        }
        confirmText={
          confirmAction.type === 'investigate'
            ? 'Sí, investigar'
            : 'Sí, cerrar'
        }
        cancelText="No, volver"
        type={
          confirmAction.type === 'investigate'
            ? 'info'
            : 'success'
        }
      />
    </div>
  );
}
