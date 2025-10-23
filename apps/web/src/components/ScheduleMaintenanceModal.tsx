import { useState } from 'react';
import { MaintenanceType, MaintenanceTypeLabels } from '@sorty/validators';
import { maintenanceApi } from '../services/maintenanceApi';
import { Button } from './forms/Button';
import { Input } from './forms/Input';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId: string;
  assetName: string;
}

export default function ScheduleMaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
  assetId,
  assetName,
}: ScheduleMaintenanceModalProps) {
  const [formData, setFormData] = useState({
    type: MaintenanceType.PREVENTIVO,
    scheduledDate: '',
    description: '',
    performedBy: '',
    cost: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await maintenanceApi.scheduleMaintenance({
        assetId,
        type: formData.type,
        scheduledDate: formData.scheduledDate,
        description: formData.description,
        performedBy: formData.performedBy || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al programar mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: MaintenanceType.PREVENTIVO,
      scheduledDate: '',
      description: '',
      performedBy: '',
      cost: '',
      notes: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in-scale">
        <h2 className="text-2xl font-bold mb-4">🔧 Programar Mantenimiento</h2>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Activo:</p>
          <p className="font-semibold">{assetName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de mantenimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Mantenimiento *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as MaintenanceType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={MaintenanceType.PREVENTIVO}>
                {MaintenanceTypeLabels[MaintenanceType.PREVENTIVO]}
              </option>
              <option value={MaintenanceType.CORRECTIVO}>
                {MaintenanceTypeLabels[MaintenanceType.CORRECTIVO]}
              </option>
            </select>
          </div>

          {/* Fecha programada */}
          <Input
            label="Fecha Programada *"
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe el mantenimiento a realizar"
              required
            />
          </div>

          {/* Realizado por */}
          <Input
            label="Realizado por"
            type="text"
            value={formData.performedBy}
            onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            placeholder="Técnico o empresa responsable"
          />

          {/* Costo estimado */}
          <Input
            label="Costo Estimado"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="0.00"
          />

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
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
              {loading ? 'Programando...' : 'Programar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
