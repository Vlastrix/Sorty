import { useState, useEffect } from 'react'
import { Button } from './forms/Button'

interface DecommissionAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    reason: string
    documentReference: string
    notes?: string
  }) => Promise<void>
  assetCode: string
  assetName: string
  isLoading?: boolean
}

export default function DecommissionAssetModal({
  isOpen,
  onClose,
  onSubmit,
  assetCode,
  assetName,
  isLoading = false
}: DecommissionAssetModalProps) {
  const [reason, setReason] = useState('')
  const [documentReference, setDocumentReference] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setReason('')
      setDocumentReference('')
      setNotes('')
      setSubmitting(false)
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!reason || reason.trim().length < 10) {
      newErrors.reason = 'El motivo debe tener al menos 10 caracteres'
    }

    if (!documentReference || documentReference.trim().length < 1) {
      newErrors.documentReference = 'El documento de respaldo es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        reason: reason.trim(),
        documentReference: documentReference.trim(),
        notes: notes.trim() || undefined
      })
      onClose()
    } catch (error: any) {
      console.error('Error al dar de baja el activo:', error)
      alert(error.message || 'Error al dar de baja el activo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-red-600">⚠️ Dar de Baja Activo</h2>
              <p className="text-sm text-gray-600 mt-1">
                {assetCode} - {assetName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={submitting}
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Atención:</strong> Esta acción cambiará el estado del activo a "Dado de baja". 
              El activo será desasignado automáticamente y se registrará un movimiento de baja en el historial.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Motivo de la baja */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la baja <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Describa el motivo de la baja (mínimo 10 caracteres)"
                disabled={submitting}
                required
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {reason.length} / 500 caracteres
              </p>
            </div>

            {/* Documento de respaldo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento de Respaldo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={documentReference}
                onChange={(e) => setDocumentReference(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.documentReference ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Resolución No. 123/2025, Acta No. 456/2025"
                disabled={submitting}
                required
              />
              {errors.documentReference && (
                <p className="mt-1 text-sm text-red-600">{errors.documentReference}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Número de documento, resolución, acta u otro respaldo oficial
              </p>
            </div>

            {/* Notas adicionales (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Información adicional relevante..."
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Observaciones, estado físico, ubicación actual, etc.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={submitting || isLoading}
                loading={submitting || isLoading}
              >
                {submitting ? 'Dando de baja...' : 'Confirmar Baja'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
