import { useState, useEffect } from 'react'
import { ReportType as ReportTypeEnum, ReportTypeLabels, ReportTypeDescriptions, AssetStatus, AssetStatusLabels } from '@sorty/validators'
import { apiClient } from '../lib/api'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Icon from '../components/Icon';

interface ReportTypeInfo {
  type: string
  label: string
  description: string
  filters: string[]
}

interface ReportResult {
  reportType: string
  generatedAt: string
  generatedBy: {
    id: string
    email: string
    name?: string
  }
  summary: {
    totalAssets: number
    totalValue: number
    averageAge: number
    byStatus?: Record<string, number>
    byCategory?: Record<string, number>
  }
  assets: any[]
  groupedData?: {
    label: string
    count: number
    totalValue: number
    assets: any[]
  }[]
}

export default function Reports() {
  const [reportTypes, setReportTypes] = useState<ReportTypeInfo[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [report, setReport] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    loadReportTypes()
    loadCategories()
    loadUsers()
  }, [])

  const loadReportTypes = async () => {
    try {
      const response = await fetch('http://localhost:4000/reports/types', {
        headers: { 'Authorization': `Bearer ${apiClient.getToken()}` }
      })
      const data = await response.json()
      setReportTypes(data)
    } catch (error) {
      console.error('Error al cargar tipos de reportes:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/categories', {
        headers: { 'Authorization': `Bearer ${apiClient.getToken()}` }
      })
      const result = await response.json()
      // La API devuelve { success: true, data: [...] }
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data)
      } else if (Array.isArray(result)) {
        setCategories(result)
      } else {
        console.error('Formato de categorías inesperado:', result)
        setCategories([])
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      setCategories([])
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users', {
        headers: { 'Authorization': `Bearer ${apiClient.getToken()}` }
      })
      const result = await response.json()
      // La API devuelve { success: true, data: [...] }
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data)
      } else if (Array.isArray(result)) {
        setUsers(result)
      } else {
        console.error('Formato de usuarios inesperado:', result)
        setUsers([])
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setUsers([])
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({
          reportType: selectedType,
          ...filters
        })
      })
      
      if (!response.ok) {
        throw new Error('Error al generar el reporte')
      }
      
      const data = await response.json()
      setReport(data)
    } catch (error: any) {
      console.error('Error al generar reporte:', error)
      alert('Error al generar el reporte: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedReportType = reportTypes.find(t => t.type === selectedType)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-BO')
  }

  const exportToExcel = () => {
    if (!report) return

    // Preparar datos para el reporte
    const reportTitle = ReportTypeLabels[selectedType as ReportTypeEnum]
    const generatedDate = formatDate(report.generatedAt)
    
    // Crear hoja de resumen
    const summaryData = [
      ['REPORTE DE ACTIVOS FIJOS'],
      [''],
      ['Tipo de Reporte:', reportTitle],
      ['Fecha de Generación:', generatedDate],
      ['Generado por:', report.generatedBy.name || report.generatedBy.email],
      [''],
      ['RESUMEN'],
      ['Total de Activos:', report.summary.totalAssets],
      ['Valor Total:', formatCurrency(report.summary.totalValue)],
      ['Edad Promedio:', `${Math.round(report.summary.averageAge)} días`],
      [''],
      ['DETALLE DE ACTIVOS']
    ]

    // Headers de la tabla
    const headers = ['Código', 'Nombre', 'Categoría', 'Estado', 'Ubicación', 'Valor', 'Edad (días)']
    
    // Datos de activos
    const rows = report.assets.map(asset => [
      asset.code,
      asset.name,
      asset.category?.name || '-',
      AssetStatusLabels[asset.status as AssetStatus] || asset.status,
      asset.building && asset.office ? `${asset.building} - ${asset.office}` : '-',
      asset.acquisitionCost || 0,
      asset.daysInUse || 0
    ])

    // Combinar todo
    const wsData = [...summaryData, headers, ...rows]
    
    // Crear libro y hoja
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 12 },  // Código
      { wch: 30 },  // Nombre
      { wch: 20 },  // Categoría
      { wch: 15 },  // Estado
      { wch: 25 },  // Ubicación
      { wch: 15 },  // Valor
      { wch: 12 }   // Edad
    ]

    // Descargar archivo
    XLSX.writeFile(wb, `reporte_${selectedType}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    if (!report) return

    const doc = new jsPDF('landscape')
    const reportTitle = ReportTypeLabels[selectedType as ReportTypeEnum]
    
    // Título
    doc.setFontSize(18)
    doc.text('REPORTE DE ACTIVOS FIJOS', 14, 15)
    
    // Información del reporte
    doc.setFontSize(10)
    doc.text(`Tipo: ${reportTitle}`, 14, 25)
    doc.text(`Fecha: ${formatDate(report.generatedAt)}`, 14, 30)
    doc.text(`Generado por: ${report.generatedBy.name || report.generatedBy.email}`, 14, 35)
    
    // Resumen
    doc.setFontSize(12)
    doc.text('RESUMEN', 14, 45)
    doc.setFontSize(9)
    doc.text(`Total de Activos: ${report.summary.totalAssets}`, 14, 52)
    doc.text(`Valor Total: ${formatCurrency(report.summary.totalValue)}`, 14, 57)
    doc.text(`Edad Promedio: ${Math.round(report.summary.averageAge)} días`, 14, 62)
    
    // Tabla de activos
    autoTable(doc, {
      startY: 70,
      head: [['Código', 'Nombre', 'Categoría', 'Estado', 'Ubicación', 'Valor', 'Edad']],
      body: report.assets.map(asset => [
        asset.code,
        asset.name,
        asset.category?.name || '-',
        AssetStatusLabels[asset.status as AssetStatus] || asset.status,
        asset.building && asset.office ? `${asset.building} - ${asset.office}` : '-',
        formatCurrency(asset.acquisitionCost || 0),
        `${asset.daysInUse || 0} días`
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 70 }
    })
    
    // Guardar PDF
    doc.save(`reporte_${selectedType}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900"><Icon name="chart-bar" /> Reportes y Consultas</h1>
          <p className="mt-2 text-gray-600">
            Genera reportes detallados sobre tus activos fijos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuración */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configurar Reporte
              </h2>

              {/* Selector de tipo de reporte */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    setFilters({})
                    setReport(null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {reportTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReportType && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    {selectedReportType.description}
                  </p>
                </div>
              )}

              {/* Filtros específicos según el tipo de reporte */}
              {selectedType === 'BY_CATEGORY' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={filters.categoryId || ''}
                      onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Todas</option>
                      {Array.isArray(categories) && categories.filter(c => !c.parentId).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.includeSubcategories !== false}
                      onChange={(e) => setFilters({ ...filters, includeSubcategories: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Incluir subcategorías
                    </label>
                  </div>
                </div>
              )}

              {selectedType === 'BY_STATUS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Todos</option>
                    {Object.entries(AssetStatusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedType === 'BY_LOCATION' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación (búsqueda)
                  </label>
                  <input
                    type="text"
                    placeholder="Edificio, oficina..."
                    value={filters.location || ''}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}

              {selectedType === 'BY_RESPONSIBLE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable
                  </label>
                  <select
                    value={filters.responsibleId || ''}
                    onChange={(e) => setFilters({ ...filters, responsibleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Todos</option>
                    {Array.isArray(users) && users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedType === 'USEFUL_LIFE_EXPIRING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meses hasta vencimiento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={filters.monthsToExpire || 12}
                    onChange={(e) => setFilters({ ...filters, monthsToExpire: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Muestra activos con vida útil menor a este valor
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateReport}
                disabled={!selectedType || loading}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Generando...' : (
                  <>
                    <Icon name="search" /> Generar Reporte
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2">
            {report ? (
              <div className="bg-white rounded-lg shadow">
                {/* Cabecera del reporte */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {reportTypes.find(t => t.type === report.reportType)?.label}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Generado: {formatDate(report.generatedAt)} por {report.generatedBy.name || report.generatedBy.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Exportar Excel</span>
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Exportar PDF</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Total Activos</p>
                      <p className="text-2xl font-bold text-blue-600">{report.summary.totalAssets}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(report.summary.totalValue)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Edad Promedio</p>
                      <p className="text-2xl font-bold text-purple-600">{Math.round(report.summary.averageAge)} días</p>
                    </div>
                  </div>
                </div>

                {/* Datos agrupados */}
                {report.groupedData && report.groupedData.length > 0 && (
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribución</h3>
                    <div className="space-y-2">
                      {report.groupedData.map((group, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{group.label}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{group.count} activos</span>
                            <span className="text-sm font-semibold text-green-600">{formatCurrency(group.totalValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de activos */}
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Activos ({report.assets.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Código</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Categoría</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Ubicación</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Valor</th>
                          {report.reportType === 'USEFUL_LIFE_EXPIRING' && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Vida Restante</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.assets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 w-24">{asset.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{asset.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 w-32">{asset.category?.name || '-'}</td>
                            <td className="px-4 py-3 text-sm w-40">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                asset.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                                asset.status === 'IN_REPAIR' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {AssetStatusLabels[asset.status as AssetStatus] || asset.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 w-48">
                              {asset.building && asset.office ? `${asset.building} - ${asset.office}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 w-32">
                              {formatCurrency(asset.acquisitionCost || 0)}
                            </td>
                            {report.reportType === 'USEFUL_LIFE_EXPIRING' && (
                              <td className="px-4 py-3 text-sm text-right">
                                <span className={`font-semibold ${
                                  asset.remainingLife < 3 ? 'text-red-600' :
                                  asset.remainingLife < 6 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {asset.remainingLife} meses
                                </span>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4"><Icon name="chart-bar" /></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Selecciona un tipo de reporte
                </h3>
                <p className="text-gray-600">
                  Configura los filtros y genera un reporte para visualizar los datos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
