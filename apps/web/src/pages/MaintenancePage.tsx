import { useState, useEffect } from 'react';
import {
  Maintenance,
  MaintenanceType,
  MaintenanceStatus,
  MaintenanceTypeLabels,
  MaintenanceStatusLabels,
  canManageAssets,
} from '@sorty/validators';
import { maintenanceApi } from '../services/maintenanceApi';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/forms/Button';
import CreateMaintenanceModal from '../components/CreateMaintenanceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useNotification } from '../hooks/useNotification';

export default function MaintenancePage() {
  const { user } = useAuth();
  const { showNotification, NotificationContainer } = useNotification();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filtros
  const [filterType, setFilterType] = useState<MaintenanceType | ''>('');
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | ''>('');

  // Estados para modales de confirmación
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    type: 'start' | 'complete' | 'cancel';
    maintenanceId: string;
    maintenanceName: string;
  }>({
    show: false,
    type: 'start',
    maintenanceId: '',
    maintenanceName: '',
  });

  const canManage = user ? canManageAssets(user.role) : false;

  useEffect(() => {
    loadMaintenances();
  }, [filterType, filterStatus]);

  const loadMaintenances = async () => {
    try {
      setLoading(true);
      const data = await maintenanceApi.getMaintenances({
        type: filterType || undefined,
        status: filterStatus || undefined,
      });
      setMaintenances(data);
      setError('');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar mantenimientos';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await maintenanceApi.startMaintenance(id);
      await loadMaintenances();
      showNotification('Mantenimiento iniciado exitosamente', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al iniciar mantenimiento', 'error');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await maintenanceApi.completeMaintenance(id, {});
      await loadMaintenances();
      showNotification('Mantenimiento completado exitosamente', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al completar mantenimiento', 'error');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await maintenanceApi.cancelMaintenance(id);
      await loadMaintenances();
      showNotification('Mantenimiento cancelado exitosamente', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al cancelar mantenimiento', 'error');
    }
  };

  const openConfirmModal = (type: 'start' | 'complete' | 'cancel', maintenance: Maintenance) => {
    setConfirmAction({
      show: true,
      type,
      maintenanceId: maintenance.id,
      maintenanceName: maintenance.asset?.name || maintenance.description,
    });
  };

  const handleConfirmAction = async () => {
    const { type, maintenanceId } = confirmAction;
    
    switch (type) {
      case 'start':
        await handleStart(maintenanceId);
        break;
      case 'complete':
        await handleComplete(maintenanceId);
        break;
      case 'cancel':
        await handleCancel(maintenanceId);
        break;
    }
    
    setConfirmAction({ show: false, type: 'start', maintenanceId: '', maintenanceName: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case MaintenanceStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case MaintenanceStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case MaintenanceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <NotificationContainer />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔧 Mantenimientos</h1>
          <p className="text-gray-600 mt-2">
            Gestión de mantenimientos preventivos y correctivos
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <span>➕</span>
            Programar Mantenimiento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Mantenimiento
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MaintenanceType | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value={MaintenanceType.PREVENTIVO}>
                {MaintenanceTypeLabels[MaintenanceType.PREVENTIVO]}
              </option>
              <option value={MaintenanceType.CORRECTIVO}>
                {MaintenanceTypeLabels[MaintenanceType.CORRECTIVO]}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as MaintenanceStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value={MaintenanceStatus.SCHEDULED}>
                {MaintenanceStatusLabels[MaintenanceStatus.SCHEDULED]}
              </option>
              <option value={MaintenanceStatus.IN_PROGRESS}>
                {MaintenanceStatusLabels[MaintenanceStatus.IN_PROGRESS]}
              </option>
              <option value={MaintenanceStatus.COMPLETED}>
                {MaintenanceStatusLabels[MaintenanceStatus.COMPLETED]}
              </option>
              <option value={MaintenanceStatus.CANCELLED}>
                {MaintenanceStatusLabels[MaintenanceStatus.CANCELLED]}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {maintenances.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">📊 Resumen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">
                {
                  maintenances.filter((m) => m.status === MaintenanceStatus.SCHEDULED)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Programados</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-2xl font-bold text-yellow-600">
                {
                  maintenances.filter((m) => m.status === MaintenanceStatus.IN_PROGRESS)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">En Progreso</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">
                {
                  maintenances.filter((m) => m.status === MaintenanceStatus.COMPLETED)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-600">
                {
                  maintenances.filter((m) => m.status === MaintenanceStatus.CANCELLED)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de mantenimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando mantenimientos...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : maintenances.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay mantenimientos registrados
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
                    Programado
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
                {maintenances.map((maintenance) => (
                  <tr key={maintenance.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {maintenance.asset?.name || 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {maintenance.asset?.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {MaintenanceTypeLabels[maintenance.type]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {maintenance.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(maintenance.scheduledDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          maintenance.status
                        )}`}
                      >
                        {MaintenanceStatusLabels[maintenance.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(maintenance.cost)}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {maintenance.status === MaintenanceStatus.SCHEDULED && (
                            <>
                              <Button
                                onClick={() => openConfirmModal('start', maintenance)}
                                className="text-xs"
                              >
                                ▶️ Iniciar
                              </Button>
                              <Button
                                onClick={() => openConfirmModal('cancel', maintenance)}
                                className="text-xs"
                              >
                                ❌
                              </Button>
                            </>
                          )}
                          {maintenance.status === MaintenanceStatus.IN_PROGRESS && (
                            <Button
                              onClick={() => openConfirmModal('complete', maintenance)}
                              className="text-xs"
                            >
                              ✅ Completar
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

      {/* Modal para crear mantenimiento */}
      {showCreateModal && (
        <CreateMaintenanceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadMaintenances();
            showNotification('Mantenimiento programado exitosamente', 'success');
          }}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmAction.show}
        onClose={() => setConfirmAction({ show: false, type: 'start', maintenanceId: '', maintenanceName: '' })}
        onConfirm={handleConfirmAction}
        title={
          confirmAction.type === 'start'
            ? '▶️ Iniciar Mantenimiento'
            : confirmAction.type === 'complete'
            ? '✅ Completar Mantenimiento'
            : '❌ Cancelar Mantenimiento'
        }
        message={
          confirmAction.type === 'start'
            ? `¿Estás seguro de que deseas iniciar el mantenimiento de "${confirmAction.maintenanceName}"?`
            : confirmAction.type === 'complete'
            ? `¿Estás seguro de que deseas marcar como completado el mantenimiento de "${confirmAction.maintenanceName}"?`
            : `¿Estás seguro de que deseas cancelar el mantenimiento de "${confirmAction.maintenanceName}"?`
        }
        confirmText={
          confirmAction.type === 'start'
            ? 'Sí, iniciar'
            : confirmAction.type === 'complete'
            ? 'Sí, completar'
            : 'Sí, cancelar'
        }
        cancelText="No, volver"
        type={
          confirmAction.type === 'start'
            ? 'info'
            : confirmAction.type === 'complete'
            ? 'success'
            : 'warning'
        }
      />
    </div>
  );
}
