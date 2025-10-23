import { useState } from 'react';
import { MovementType, MovementSubtype, MovementSubtypeLabels } from '@sorty/validators';
import { movementApi } from '../services/movementApi';
import { Button } from './forms/Button';
import { Input } from './forms/Input';

interface RegisterMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId: string;
  assetName: string;
  movementType: MovementType; // ENTRADA o SALIDA
}

export default function RegisterMovementModal({
  isOpen,
  onClose,
  onSuccess,
  assetId,
  assetName,
  movementType,
}: RegisterMovementModalProps) {
  const [formData, setFormData] = useState({
    movementType: movementType === MovementType.ENTRADA 
      ? MovementSubtype.COMPRA 
      : MovementSubtype.BAJA,
    description: '',
    cost: '',
    quantity: '1',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Opciones según el tipo de movimiento
  const subtypeOptions = movementType === MovementType.ENTRADA
    ? [
        MovementSubtype.COMPRA,
        MovementSubtype.DONACION_IN,
        MovementSubtype.TRANSFERENCIA_IN,
      ]
    : [
        MovementSubtype.BAJA,
        MovementSubtype.VENTA,
        MovementSubtype.DONACION_OUT,
        MovementSubtype.TRANSFERENCIA_OUT,
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        assetId,
        movementType: formData.movementType as MovementSubtype,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        quantity: parseInt(formData.quantity),
        notes: formData.notes || undefined,
      };

      if (movementType === MovementType.ENTRADA) {
        await movementApi.registerEntry(data);
      } else {
        await movementApi.registerExit(data);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      movementType: movementType === MovementType.ENTRADA 
        ? MovementSubtype.COMPRA 
        : MovementSubtype.BAJA,
      description: '',
      cost: '',
      quantity: '1',
      notes: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in-scale">
        <h2 className="text-2xl font-bold mb-4">
          {movementType === MovementType.ENTRADA ? '📥 Registrar Entrada' : '📤 Registrar Salida'}
        </h2>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Activo:</p>
          <p className="font-semibold">{assetName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de {movementType === MovementType.ENTRADA ? 'Entrada' : 'Salida'} *
            </label>
            <select
              value={formData.movementType}
              onChange={(e) =>
                setFormData({ ...formData, movementType: e.target.value as MovementSubtype })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {subtypeOptions.map((subtype) => (
                <option key={subtype} value={subtype}>
                  {MovementSubtypeLabels[subtype]}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <Input
            label="Descripción *"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Describe el movimiento"
          />

          {/* Costo */}
          <Input
            label="Costo"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="0.00"
          />

          {/* Cantidad */}
          <Input
            label="Cantidad *"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Información adicional..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
