import { useState, useEffect } from 'react';
import { MovementType, MovementSubtype, MovementSubtypeLabels } from '@sorty/validators';
import { movementApi } from '../services/movementApi';
import { assetApi } from '../services/assetApi';
import { Button } from './forms/Button';
import { Input } from './forms/Input';

interface CreateMovementModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMovementModal({
  onClose,
  onSuccess,
}: CreateMovementModalProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: '',
    movementType: MovementType.ENTRADA,
    movementSubtype: MovementSubtype.COMPRA,
    description: '',
    cost: '',
    quantity: '1',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await assetApi.getAll();
      setAssets(response.assets);
    } catch (err) {
      console.error('Error loading assets:', err);
    }
  };

  // Opciones de subtipo según el tipo de movimiento
  const getSubtypeOptions = () => {
    if (formData.movementType === MovementType.ENTRADA) {
      return [
        { value: MovementSubtype.COMPRA, label: MovementSubtypeLabels[MovementSubtype.COMPRA] },
        { value: MovementSubtype.DONACION_IN, label: MovementSubtypeLabels[MovementSubtype.DONACION_IN] },
        { value: MovementSubtype.TRANSFERENCIA_IN, label: MovementSubtypeLabels[MovementSubtype.TRANSFERENCIA_IN] },
      ];
    } else {
      return [
        { value: MovementSubtype.BAJA, label: MovementSubtypeLabels[MovementSubtype.BAJA] },
        { value: MovementSubtype.VENTA, label: MovementSubtypeLabels[MovementSubtype.VENTA] },
        { value: MovementSubtype.DONACION_OUT, label: MovementSubtypeLabels[MovementSubtype.DONACION_OUT] },
        { value: MovementSubtype.TRANSFERENCIA_OUT, label: MovementSubtypeLabels[MovementSubtype.TRANSFERENCIA_OUT] },
      ];
    }
  };

  const handleTypeChange = (type: MovementType) => {
    // Al cambiar el tipo, resetear el subtipo al primero disponible
    const newSubtype = type === MovementType.ENTRADA 
      ? MovementSubtype.COMPRA 
      : MovementSubtype.BAJA;
    
    setFormData({
      ...formData,
      movementType: type,
      movementSubtype: newSubtype,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId) {
      setError('Debe seleccionar un activo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = formData.movementType === MovementType.ENTRADA
        ? movementApi.registerEntry
        : movementApi.registerExit;

      await endpoint({
        assetId: formData.assetId,
        movementType: formData.movementSubtype,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        quantity: parseInt(formData.quantity),
        notes: formData.notes || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-scale">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Registrar Movimiento de Inventario
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Activo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activo *
              </label>
              <select
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccione un activo</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Movimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento *
              </label>
              <select
                value={formData.movementType}
                onChange={(e) => handleTypeChange(e.target.value as MovementType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={MovementType.ENTRADA}>📥 Entrada</option>
                <option value={MovementType.SALIDA}>📤 Salida</option>
              </select>
            </div>

            {/* Subtipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtipo *
              </label>
              <select
                value={formData.movementSubtype}
                onChange={(e) => setFormData({ ...formData, movementSubtype: e.target.value as MovementSubtype })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {getSubtypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advertencia para movimientos de salida permanentes */}
            {(formData.movementSubtype === MovementSubtype.BAJA ||
              formData.movementSubtype === MovementSubtype.DONACION_OUT) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                ⚠️ Este movimiento marcará el activo como dado de baja.
              </div>
            )}

            {/* Descripción */}
            <Input
              label="Descripción *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describa el movimiento"
              required
            />

            {/* Cantidad */}
            <Input
              label="Cantidad"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              min="1"
            />

            {/* Costo */}
            <Input
              label="Costo (USD)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
            />

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional (opcional)"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Registrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
