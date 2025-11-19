import { useState, useEffect } from 'react';
import { MaintenanceType, MaintenanceTypeLabels } from '@sorty/validators';
import { maintenanceApi } from '../services/maintenanceApi';
import { assetApi } from '../services/assetApi';
import { Button } from './forms/Button';
import { Input } from './forms/Input';

interface CreateMaintenanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMaintenanceModal({
  onClose,
  onSuccess,
}: CreateMaintenanceModalProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: '',
    type: MaintenanceType.PREVENTIVO,
    scheduledDate: '',
    description: '',
    performedBy: '',
    cost: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId) {
      setError('Debe seleccionar un activo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await maintenanceApi.scheduleMaintenance({
        assetId: formData.assetId,
        type: formData.type,
        scheduledDate: formData.scheduledDate,
        description: formData.description,
        performedBy: formData.performedBy || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al programar mantenimiento');
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
              Programar Mantenimiento
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
                data-testid="maintenance-asset-select"
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

            {/* Tipo de Mantenimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                data-testid="maintenance-type-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
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

            {/* Fecha Programada */}
            <Input
              data-testid="maintenance-date-input"
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
                data-testid="maintenance-description-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describa el mantenimiento a realizar"
                required
              />
            </div>

            {/* Realizado por */}
            <Input
              data-testid="maintenance-performedby-input"
              label="Realizado por"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
              placeholder="Nombre del técnico o empresa"
            />

            {/* Costo Estimado */}
            <Input
              data-testid="maintenance-cost-input"
              label="Costo Estimado (USD)"
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
                data-testid="maintenance-notes-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
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
                data-testid="maintenance-submit-button"
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Programar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
