import { useState, useEffect } from 'react'
import { Button } from './forms/Button'
import { Input } from './forms/Input'
import { User } from '@sorty/validators'

interface AssignAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    assignedToId: string
    location?: string
    reason?: string
    notes?: string
  }) => Promise<void>
  assetCode: string
  assetName: string
  users: User[]
  isLoading?: boolean
}

export default function AssignAssetModal({
  isOpen,
  onClose,
  onSubmit,
  assetCode,
  assetName,
  users,
  isLoading = false
}: AssignAssetModalProps) {
  const [assignedToId, setAssignedToId] = useState('')
  const [location, setLocation] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setAssignedToId('')
      setLocation('')
      setReason('')
      setNotes('')
      setSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignedToId) {
      alert('Por favor selecciona un responsable')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        assignedToId,
        location: location || undefined,
        reason: reason || undefined,
        notes: notes || undefined
      })
      onClose()
    } catch (error) {
      console.error('Error al asignar activo:', error)
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
              <h2 className="text-2xl font-bold text-gray-900">Asignar Activo</h2>
              <p className="text-sm text-gray-600 mt-1">
                {assetCode} - {assetName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-2">
                Responsable <span className="text-red-500">*</span>
              </label>
              <select
                id="assignedToId"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting || isLoading}
              >
                <option value="">Seleccionar usuario...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                id="location"
                label="Ubicación"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Edificio A, Oficina 201"
                disabled={submitting}
              />
            </div>

            <div>
              <Input
                id="reason"
                label="Motivo de asignación"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Asignación inicial, Reemplazo de equipo"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional sobre la asignación..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || isLoading}
              >
                {submitting ? 'Asignando...' : 'Asignar Activo'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
