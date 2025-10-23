import { useState, useEffect } from 'react'
import { assignmentApi } from '../services/assignmentApi'
import { AssetAssignment, AssignmentStatus, AssignmentStatusLabels } from '@sorty/validators'

export default function AssignmentHistory() {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('')
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignment | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [statusFilter])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await assignmentApi.getAssignmentHistory(
        statusFilter ? { status: statusFilter as AssignmentStatus } : undefined
      )
      setAssignments(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el historial de asignaciones')
      console.error('Error loading assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ACTIVE:
        return 'bg-green-100 text-green-800'
      case AssignmentStatus.RETURNED:
        return 'bg-gray-100 text-gray-800'
      case AssignmentStatus.TRANSFERRED:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Asignaciones</h1>
          <p className="text-gray-600 mt-2">Registro completo de todas las asignaciones de activos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value={AssignmentStatus.ACTIVE}>Activas</option>
            <option value={AssignmentStatus.RETURNED}>Devueltas</option>
            <option value={AssignmentStatus.TRANSFERRED}>Transferidas</option>
          </select>
          <span className="text-sm text-gray-600 ml-auto">
            {assignments.length} asignación(es)
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
          {error}
        </div>
      )}

      {/* Tabla de asignaciones */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Devuelto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay asignaciones registradas
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {assignment.asset?.code}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]" title={assignment.asset?.name}>
                          {assignment.asset?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {assignment.assignedTo?.name || assignment.assignedTo?.email}
                        </span>
                        {assignment.assignedTo?.name && (
                          <span className="text-xs text-gray-500">
                            {assignment.assignedTo.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 truncate max-w-[150px] block" title={assignment.location || '-'}>
                        {assignment.location || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-900">
                          {new Date(assignment.assignedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(assignment.assignedAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {assignment.returnedAt ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-900">
                            {new Date(assignment.returnedAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(assignment.returnedAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(assignment.status)}`}>
                        {AssignmentStatusLabels[assignment.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles de asignación */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    📋 Detalles de Asignación
                  </h2>
                  <span className={`mt-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(selectedAssignment.status)}`}>
                    {AssignmentStatusLabels[selectedAssignment.status]}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del Activo */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">📦 Activo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Código:</span>
                      <p className="text-blue-900">{selectedAssignment.asset?.code}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Nombre:</span>
                      <p className="text-blue-900">{selectedAssignment.asset?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Categoría:</span>
                      <p className="text-blue-900">{selectedAssignment.asset?.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">ID del Activo:</span>
                      <p className="text-blue-900 text-xs font-mono">{selectedAssignment.assetId}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Responsable */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">👤 Responsable</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Nombre:</span>
                      <p className="text-green-900">{selectedAssignment.assignedTo?.name || 'Sin nombre'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Email:</span>
                      <p className="text-green-900">{selectedAssignment.assignedTo?.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Rol:</span>
                      <p className="text-green-900">{selectedAssignment.assignedTo?.role || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información de Ubicación */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">📍 Ubicación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="md:col-span-2">
                      <span className="font-medium text-purple-700">Ubicación completa:</span>
                      <p className="text-purple-900">{selectedAssignment.location || 'Sin ubicación especificada'}</p>
                    </div>
                  </div>
                </div>

                {/* Información de Fechas */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">📅 Fechas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-orange-700">Fecha de asignación:</span>
                      <p className="text-orange-900">{formatDate(selectedAssignment.assignedAt)}</p>
                    </div>
                    {selectedAssignment.returnedAt && (
                      <div>
                        <span className="font-medium text-orange-700">Fecha de devolución:</span>
                        <p className="text-orange-900">{formatDate(selectedAssignment.returnedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo y Notas */}
                {(selectedAssignment.reason || selectedAssignment.notes) && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Información Adicional</h3>
                    {selectedAssignment.reason && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700">Motivo:</span>
                        <p className="text-gray-900 mt-1">{selectedAssignment.reason}</p>
                      </div>
                    )}
                    {selectedAssignment.notes && (
                      <div>
                        <span className="font-medium text-gray-700">Notas:</span>
                        <p className="text-gray-900 mt-1">{selectedAssignment.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Cerrar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
