import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth.routes.js'
import { categoriesRoutes } from './routes/categories.routes.js'
import { assetsRoutes } from './routes/assets.routes.js'

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
await app.register(categoriesRoutes)
await app.register(assetsRoutes)

const port = Number(process.env.PORT || 4000)
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`🚀 API corriendo en http://localhost:${port}`)
  console.log(`📦 Catálogo de Activos disponible en las rutas:`)
  console.log(`   GET    /categories - Listar categorías`)
  console.log(`   POST   /categories - Crear categoría`)
  console.log(`   GET    /assets - Listar activos`)
  console.log(`   POST   /assets - Crear activo`)
  console.log(`   GET    /assets-stats - Estadísticas`)
})