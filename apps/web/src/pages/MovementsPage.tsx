import { useState, useEffect } from 'react';
import {
  AssetMovement,
  MovementType,
  MovementSubtype,
  MovementTypeLabels,
  MovementSubtypeLabels,
} from '@sorty/validators';
import { movementApi } from '../services/movementApi';
import CreateMovementModal from '../components/CreateMovementModal';

export default function MovementsPage() {
  const [movements, setMovements] = useState<AssetMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Filtros
  const [filterType, setFilterType] = useState<MovementType | ''>('');
  const [filterSubtype, setFilterSubtype] = useState<MovementSubtype | ''>('');

  useEffect(() => {
    loadMovements();
  }, [filterType, filterSubtype]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await movementApi.getMovements({
        type: filterType || undefined,
        movementType: filterSubtype || undefined,
      });
      setMovements(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Movimientos de Inventario</h1>
          <p className="text-gray-600 mt-2">Historial de entradas y salidas de activos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <span>➕</span>
          Registrar Movimiento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as MovementType | '');
                setFilterSubtype(''); // Reset subtipo al cambiar tipo
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value={MovementType.ENTRADA}>📥 {MovementTypeLabels[MovementType.ENTRADA]}</option>
              <option value={MovementType.SALIDA}>📤 {MovementTypeLabels[MovementType.SALIDA]}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtipo
            </label>
            <select
              value={filterSubtype}
              onChange={(e) => setFilterSubtype(e.target.value as MovementSubtype | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {filterType === MovementType.ENTRADA && (
                <>
                  <option value={MovementSubtype.COMPRA}>{MovementSubtypeLabels[MovementSubtype.COMPRA]}</option>
                  <option value={MovementSubtype.DONACION_IN}>{MovementSubtypeLabels[MovementSubtype.DONACION_IN]}</option>
                  <option value={MovementSubtype.TRANSFERENCIA_IN}>{MovementSubtypeLabels[MovementSubtype.TRANSFERENCIA_IN]}</option>
                </>
              )}
              {filterType === MovementType.SALIDA && (
                <>
                  <option value={MovementSubtype.BAJA}>{MovementSubtypeLabels[MovementSubtype.BAJA]}</option>
                  <option value={MovementSubtype.VENTA}>{MovementSubtypeLabels[MovementSubtype.VENTA]}</option>
                  <option value={MovementSubtype.DONACION_OUT}>{MovementSubtypeLabels[MovementSubtype.DONACION_OUT]}</option>
                  <option value={MovementSubtype.TRANSFERENCIA_OUT}>{MovementSubtypeLabels[MovementSubtype.TRANSFERENCIA_OUT]}</option>
                </>
              )}
              {!filterType && (
                <>
                  <optgroup label="Entradas">
                    <option value={MovementSubtype.COMPRA}>{MovementSubtypeLabels[MovementSubtype.COMPRA]}</option>
                    <option value={MovementSubtype.DONACION_IN}>{MovementSubtypeLabels[MovementSubtype.DONACION_IN]}</option>
                    <option value={MovementSubtype.TRANSFERENCIA_IN}>{MovementSubtypeLabels[MovementSubtype.TRANSFERENCIA_IN]}</option>
                  </optgroup>
                  <optgroup label="Salidas">
                    <option value={MovementSubtype.BAJA}>{MovementSubtypeLabels[MovementSubtype.BAJA]}</option>
                    <option value={MovementSubtype.VENTA}>{MovementSubtypeLabels[MovementSubtype.VENTA]}</option>
                    <option value={MovementSubtype.DONACION_OUT}>{MovementSubtypeLabels[MovementSubtype.DONACION_OUT]}</option>
                    <option value={MovementSubtype.TRANSFERENCIA_OUT}>{MovementSubtypeLabels[MovementSubtype.TRANSFERENCIA_OUT]}</option>
                  </optgroup>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {movements.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">📊 Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
              <p className="text-sm text-gray-600">Total Movimientos</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">
                {movements.filter((m) => m.type === MovementType.ENTRADA).length}
              </p>
              <p className="text-sm text-gray-600">Entradas</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-600">
                {movements.filter((m) => m.type === MovementType.SALIDA).length}
              </p>
              <p className="text-sm text-gray-600">Salidas</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando movimientos...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay movimientos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Activo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Costo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {formatDate(movement.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          movement.type === MovementType.ENTRADA
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {movement.type === MovementType.ENTRADA ? '📥' : '📤'}{' '}
                        {MovementSubtypeLabels[movement.movementType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {movement.asset?.name || 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {movement.asset?.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movement.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(movement.cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movement.user?.name || movement.user?.email || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para registrar movimiento */}
      {showModal && (
        <CreateMovementModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadMovements();
          }}
        />
      )}
    </div>
  );
}
