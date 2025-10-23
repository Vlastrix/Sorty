import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth.routes.js'
import { categoriesRoutes } from './routes/categories.routes.js'
import { assetsRoutes } from './routes/assets.routes.js'
import { userRoutes } from './routes/users.routes.js'
import { assignmentRoutes } from './routes/assignments.routes.js'
import { movementRoutes } from './routes/movements.routes.js'
import { maintenanceRoutes } from './routes/maintenance.routes.js'
import { incidentRoutes } from './routes/incidents.routes.js'

const app = Fastify({
  logger: false // Deshabilitamos el logger automático
})

// Registrar CORS
await app.register(cors, { origin: true })

// Health check
app.get('/health', async () => {
  return { ok: true, timestamp: new Date().toISOString() }
})

// Registrar rutas
await app.register(authRoutes, { prefix: '/auth' })
await app.register(userRoutes, { prefix: '/users' })
await app.register(categoriesRoutes)
await app.register(assetsRoutes)
await app.register(assignmentRoutes, { prefix: '/assignments' })
await app.register(movementRoutes, { prefix: '/movements' })
await app.register(maintenanceRoutes, { prefix: '/maintenance' })
await app.register(incidentRoutes, { prefix: '/incidents' })

const port = Number(process.env.PORT || 4000)
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`🚀 API corriendo en http://localhost:${port}`)
  console.log(`📦 Sistema de Gestión de Activos:`)
  console.log(`   Auth: /auth/login, /auth/register`)
  console.log(`   Usuarios: /users (CRUD, roles)`)
  console.log(`   Categorías: /categories`)
  console.log(`   Activos: /assets`)
  console.log(`   Asignaciones: /assignments (historial y control)`)
  console.log(`   Movimientos: /movements (entradas/salidas)`)
  console.log(`   Mantenimientos: /maintenance (preventivo/correctivo)`)
  console.log(`   Incidencias: /incidents (daños, pérdidas, robos)`)
})