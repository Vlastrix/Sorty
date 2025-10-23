import { useState, useEffect } from 'react'
import { Button } from './forms/Button'
import { Input } from './forms/Input'
import { User } from '@sorty/validators'

interface TransferAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    newAssignedToId: string
    building?: string
    office?: string
    reason?: string
    notes?: string
  }) => Promise<void>
  assetCode: string
  assetName: string
  currentAssignee?: string
  users: User[]
  isLoading?: boolean
}

export default function TransferAssetModal({
  isOpen,
  onClose,
  onSubmit,
  assetCode,
  assetName,
  currentAssignee,
  users,
  isLoading = false
}: TransferAssetModalProps) {
  const [newAssignedToId, setNewAssignedToId] = useState('')
  const [building, setBuilding] = useState('')
  const [office, setOffice] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setNewAssignedToId('')
      setBuilding('')
      setOffice('')
      setReason('')
      setNotes('')
      setSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAssignedToId) {
      alert('Por favor selecciona un nuevo responsable')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        newAssignedToId,
        building: building || undefined,
        office: office || undefined,
        reason: reason || undefined,
        notes: notes || undefined
      })
      onClose()
    } catch (error) {
      console.error('Error al transferir activo:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transferir Activo</h2>
              <p className="text-sm text-gray-600 mt-1">
                {assetCode} - {assetName}
              </p>
              {currentAssignee && (
                <p className="text-sm text-blue-600 mt-1">
                  Actualmente asignado a: <strong>{currentAssignee}</strong>
                </p>
              )}
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
              <label htmlFor="newAssignedToId" className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Responsable <span className="text-red-500">*</span>
              </label>
              <select
                id="newAssignedToId"
                value={newAssignedToId}
                onChange={(e) => setNewAssignedToId(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="building"
                  label="Edificio"
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="Ej: Edificio Principal"
                  disabled={submitting}
                />
              </div>
              <div>
                <Input
                  id="office"
                  label="Oficina"
                  type="text"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  placeholder="Ej: Oficina 305"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <Input
                id="reason"
                label="Motivo de transferencia"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Cambio de área, Rotación de personal"
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
                placeholder="Información adicional sobre la transferencia..."
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
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={submitting || isLoading}
              >
                {submitting ? 'Transfiriendo...' : 'Transferir Activo'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
