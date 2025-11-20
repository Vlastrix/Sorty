import { useState, useEffect } from 'react';
import { Asset, AssetStatusLabels } from '../types/assets';
import { assetApi } from '../services/assetApi';
import { maintenanceApi } from '../services/maintenanceApi';
import { useAuth } from '../contexts/AuthContext';
import ScheduleMaintenanceModal from '../components/ScheduleMaintenanceModal';
import { useNotification } from '../hooks/useNotification';
import Icon from '../components/Icon';

export default function MyAssets() {
  const { user } = useAuth();
  const { showNotification, NotificationContainer } = useNotification();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [viewDetailsAsset, setViewDetailsAsset] = useState<Asset | null>(null);
  const [assetsPendingMaintenance, setAssetsPendingMaintenance] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMyAssets();
  }, []);

  const loadMyAssets = async () => {
    try {
      setLoading(true);
      // Obtener todos los activos y filtrar los asignados al usuario actual
      const response = await assetApi.getAll();
      const myAssets = response.assets.filter(
        (asset) => asset.assignedToId === user?.id
      );
      setAssets(myAssets);
      
      // Cargar mantenimientos para verificar cuáles tienen pendientes
      await loadPendingMaintenances(myAssets);
      
      setError('');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar mis activos';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingMaintenances = async (assetsList: Asset[]) => {
    try {
      const maintenances = await maintenanceApi.getMaintenances();
      const pendingSet = new Set<string>();

      // Verificar qué activos tienen mantenimientos SCHEDULED o IN_PROGRESS
      assetsList.forEach((asset) => {
        const hasPending = maintenances.some(
          (maintenance) =>
            maintenance.assetId === asset.id &&
            (maintenance.status === 'SCHEDULED' || maintenance.status === 'IN_PROGRESS')
        );
        if (hasPending) {
          pendingSet.add(asset.id);
        }
      });

      setAssetsPendingMaintenance(pendingSet);
    } catch (err) {
      console.error('Error al cargar mantenimientos:', err);
    }
  };

  const handleRequestMaintenance = (asset: Asset) => {
    if (assetsPendingMaintenance.has(asset.id)) {
      showNotification('Este activo ya tiene un mantenimiento pendiente', 'warning');
      return;
    }
    setSelectedAsset(asset);
    setShowMaintenanceModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'IN_REPAIR':
        return 'bg-yellow-100 text-yellow-800';
      case 'DECOMMISSIONED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <NotificationContainer />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="box" /> Mis Activos Asignados
        </h1>
        <p className="text-gray-600 mt-2">
          Activos bajo tu responsabilidad. Puedes solicitar mantenimiento cuando lo necesites.
        </p>
      </div>

      {/* Resumen */}
      {assets.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="chart-bar" /> Resumen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-3xl font-bold text-blue-600">{assets.length}</p>
              <p className="text-sm text-gray-600">Total de activos</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-3xl font-bold text-green-600">
                {assets.filter((a) => a.status === 'IN_USE').length}
              </p>
              <p className="text-sm text-gray-600">En uso</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-3xl font-bold text-yellow-600">
                {assets.filter((a) => a.status === 'IN_REPAIR').length}
              </p>
              <p className="text-sm text-gray-600">En reparación</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de activos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Cargando mis activos...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : assets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No tienes activos asignados</p>
            <p className="text-sm mt-2">
              Cuando te asignen activos, aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asignado desde
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {asset.code}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.name}
                      </div>
                      {asset.brand && (
                        <div className="text-xs text-gray-500">
                          {asset.brand} {asset.model}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {asset.category.name}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          asset.status
                        )}`}
                      >
                        {AssetStatusLabels[asset.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div>{asset.building || '-'}</div>
                      {asset.office && (
                        <div className="text-xs text-gray-500">{asset.office}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(asset.assignedAt)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewDetailsAsset(asset)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleRequestMaintenance(asset)}
                          disabled={assetsPendingMaintenance.has(asset.id)}
                          className={`font-medium ${
                            assetsPendingMaintenance.has(asset.id)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-orange-600 hover:text-orange-800'
                          }`}
                          title={
                            assetsPendingMaintenance.has(asset.id)
                              ? 'Ya tiene mantenimiento pendiente'
                              : 'Solicitar mantenimiento'
                          }
                        >
                          <Icon name="wrench" /> {assetsPendingMaintenance.has(asset.id) ? 'Mantenimiento Pendiente' : 'Solicitar Mantenimiento'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de solicitud de mantenimiento */}
      <ScheduleMaintenanceModal
        isOpen={showMaintenanceModal && !!selectedAsset}
        assetId={selectedAsset?.id || ''}
        assetName={selectedAsset?.name || ''}
        onClose={() => {
          setShowMaintenanceModal(false);
          setSelectedAsset(null);
        }}
        onSuccess={() => {
          setShowMaintenanceModal(false);
          setSelectedAsset(null);
          showNotification('Solicitud de mantenimiento enviada exitosamente', 'success');
          // Recargar para actualizar el estado de los botones
          loadMyAssets();
        }}
      />

      {/* Modal de detalles del activo */}
      {viewDetailsAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <Icon name="box" /> {viewDetailsAsset.name}
                  </h2>
                  <span
                    className={`mt-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                      viewDetailsAsset.status
                    )}`}
                  >
                    {AssetStatusLabels[viewDetailsAsset.status]}
                  </span>
                </div>
                <button
                  onClick={() => setViewDetailsAsset(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Información básica */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    <Icon name="clipboard" /> Información Básica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Código:</span>
                      <p className="text-blue-900">{viewDetailsAsset.code}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Categoría:</span>
                      <p className="text-blue-900">{viewDetailsAsset.category.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Marca:</span>
                      <p className="text-blue-900">{viewDetailsAsset.brand || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Modelo:</span>
                      <p className="text-blue-900">{viewDetailsAsset.model || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-700">Número de Serie:</span>
                      <p className="text-blue-900">
                        {viewDetailsAsset.serialNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {viewDetailsAsset.description && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Icon name="file-alt" /> Descripción
                    </h3>
                    <p className="text-gray-700">{viewDetailsAsset.description}</p>
                  </div>
                )}

                {/* Ubicación */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">
                    <Icon name="map-marker" /> Ubicación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-purple-700">Edificio:</span>
                      <p className="text-purple-900">{viewDetailsAsset.building || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-purple-700">Oficina:</span>
                      <p className="text-purple-900">{viewDetailsAsset.office || 'N/A'}</p>
                    </div>
                    {viewDetailsAsset.laboratory && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-purple-700">Laboratorio:</span>
                        <p className="text-purple-900">{viewDetailsAsset.laboratory}</p>
                      </div>
                    )}
                    {viewDetailsAsset.currentLocation && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-purple-700">
                          Ubicación actual:
                        </span>
                        <p className="text-purple-900">{viewDetailsAsset.currentLocation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3"><Icon name="calendar" /> Fechas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-orange-700">Fecha de compra:</span>
                      <p className="text-orange-900">
                        {formatDate(viewDetailsAsset.purchaseDate)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-orange-700">Asignado desde:</span>
                      <p className="text-orange-900">
                        {formatDate(viewDetailsAsset.assignedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setViewDetailsAsset(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setViewDetailsAsset(null);
                    handleRequestMaintenance(viewDetailsAsset);
                  }}
                  disabled={assetsPendingMaintenance.has(viewDetailsAsset.id)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                    assetsPendingMaintenance.has(viewDetailsAsset.id)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                  title={
                    assetsPendingMaintenance.has(viewDetailsAsset.id)
                      ? 'Este activo ya tiene mantenimiento pendiente'
                      : 'Solicitar mantenimiento'
                  }
                >
                  {assetsPendingMaintenance.has(viewDetailsAsset.id)
                    ? 'Mantenimiento Pendiente'
                    : 'Solicitar Mantenimiento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
