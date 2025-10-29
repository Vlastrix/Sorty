import type { FastifyPluginAsync } from 'fastify'
import { generateReport } from '../reports/service.js'
import { authenticateUser } from '../auth/middleware.js'

export const reportsRoutes: FastifyPluginAsync = async (app) => {
  // Todas las rutas de reportes requieren autenticación
  app.addHook('preHandler', authenticateUser)

  /**
   * POST /reports/generate
   * Genera un reporte basado en los filtros especificados
   */
  app.post('/generate', async (request, reply) => {
    try {
      const filters = request.body as any
      const userId = (request.user as any).userId

      // Validar que se especific un tipo de reporte
      if (!filters.reportType) {
        return reply.status(400).send({
          error: 'El tipo de reporte es requerido'
        })
      }

      const report = await generateReport(filters, userId)

      return reply.send(report)
    } catch (error: any) {
      console.error('Error al generar reporte:', error)
      return reply.status(500).send({
        error: 'Error al generar el reporte',
        details: error.message
      })
    }
  })

  /**
   * GET /reports/types
   * Obtiene la lista de tipos de reportes disponibles
   */
  app.get('/types', async (request, reply) => {
    const reportTypes = [
      {
        type: 'BY_CATEGORY',
        label: 'Por Categoría',
        description: 'Listado de activos agrupados por categoría',
        filters: ['categoryId', 'includeSubcategories']
      },
      {
        type: 'BY_LOCATION',
        label: 'Por Ubicación',
        description: 'Listado de activos según su ubicación física',
        filters: ['location']
      },
      {
        type: 'BY_STATUS',
        label: 'Por Estado',
        description: 'Listado de activos por estado',
        filters: ['status']
      },
      {
        type: 'BY_RESPONSIBLE',
        label: 'Por Responsable',
        description: 'Activos asignados a cada responsable',
        filters: ['responsibleId']
      },
      {
        type: 'USEFUL_LIFE_EXPIRING',
        label: 'Vida Útil Próxima a Vencer',
        description: 'Activos próximos a completar su vida útil',
        filters: ['monthsToExpire']
      },
      {
        type: 'MAINTENANCE_PENDING',
        label: 'Mantenimiento Pendiente',
        description: 'Activos con mantenimientos programados o pendientes',
        filters: []
      },
      {
        type: 'IN_REPAIR',
        label: 'En Reparación',
        description: 'Activos actualmente en reparación',
        filters: []
      }
    ]

    return reply.send(reportTypes)
  })

  /**
   * GET /reports/summary
   * Obtiene un resumen general de los activos
   */
  app.get('/summary', async (request, reply) => {
    try {
      const userId = (request.user as any).userId

      // Generar varios reportes en paralelo para el resumen
      const [byStatus, byCategory, maintenancePending, inRepair] = await Promise.all([
        generateReport({ reportType: 'BY_STATUS' }, userId),
        generateReport({ reportType: 'BY_CATEGORY' }, userId),
        generateReport({ reportType: 'MAINTENANCE_PENDING' }, userId),
        generateReport({ reportType: 'IN_REPAIR' }, userId)
      ])

      return reply.send({
        summary: {
          totalAssets: byStatus.summary.totalAssets,
          totalValue: byStatus.summary.totalValue,
          averageAge: byStatus.summary.averageAge,
          byStatus: (byStatus.summary as any).byStatus,
          byCategory: (byCategory.summary as any).byCategory,
          maintenancePending: maintenancePending.summary.totalAssets,
          inRepair: inRepair.summary.totalAssets
        },
        generatedAt: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error al generar resumen:', error)
      return reply.status(500).send({
        error: 'Error al generar el resumen',
        details: error.message
      })
    }
  })
}
