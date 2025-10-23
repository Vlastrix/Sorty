import { useState } from 'react';
import { IncidentType, IncidentTypeLabels } from '@sorty/validators';
import { incidentApi } from '../services/incidentApi';
import { Button } from './forms/Button';
import { Input } from './forms/Input';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId: string;
  assetName: string;
}

export default function ReportIncidentModal({
  isOpen,
  onClose,
  onSuccess,
  assetId,
  assetName,
}: ReportIncidentModalProps) {
  const [formData, setFormData] = useState({
    type: IncidentType.DANO,
    description: '',
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
      await incidentApi.reportIncident({
        assetId,
        type: formData.type,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al reportar incidencia');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: IncidentType.DANO,
      description: '',
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
        <h2 className="text-2xl font-bold mb-4">⚠️ Reportar Incidencia</h2>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Activo:</p>
          <p className="font-semibold">{assetName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de incidencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Incidencia *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as IncidentType })
              }
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
              placeholder="Describe detalladamente qué ocurrió"
              required
            />
          </div>

          {/* Costo estimado */}
          <Input
            label="Costo Estimado de Reparación/Reemplazo"
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

          {/* Advertencia para robo/pérdida */}
          {(formData.type === IncidentType.ROBO || formData.type === IncidentType.PERDIDA) && (
            <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
              ⚠️ <strong>Importante:</strong> Al reportar {formData.type === IncidentType.ROBO ? 'un robo' : 'una pérdida'}, 
              el activo será automáticamente dado de baja del inventario.
            </div>
          )}

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
              {loading ? 'Reportando...' : 'Reportar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
