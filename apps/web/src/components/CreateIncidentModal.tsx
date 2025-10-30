import { useState, useEffect } from 'react';
import { IncidentType, IncidentTypeLabels } from '@sorty/validators';
import { incidentApi } from '../services/incidentApi';
import { assetApi } from '../services/assetApi';
import { Button } from './forms/Button';
import { Input } from './forms/Input';
import Icon from '../components/Icon';

interface CreateIncidentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateIncidentModal({
  onClose,
  onSuccess,
}: CreateIncidentModalProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    assetId: '',
    type: IncidentType.DANO,
    description: '',
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
      await incidentApi.reportIncident({
        assetId: formData.assetId,
        type: formData.type,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al reportar incidencia');
    } finally {
      setLoading(false);
    }
  };

  const isDecommissioningIncident = 
    formData.type === IncidentType.ROBO || 
    formData.type === IncidentType.PERDIDA;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-scale">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Reportar Incidencia
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

            {/* Tipo de Incidencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Incidencia *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as IncidentType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
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

            {/* Advertencia para robos y pérdidas */}
            {isDecommissioningIncident && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                <Icon name="warning" /> Esta incidencia marcará el activo como dado de baja automáticamente.
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describa la incidencia en detalle"
                required
              />
            </div>

            {/* Costo Estimado */}
            <Input
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
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Reportar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
