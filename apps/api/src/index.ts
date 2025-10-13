import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { registerSchema, loginSchema } from './auth/schemas.js'
import { registerUser, loginUser } from './auth/service.js'
import { authenticateUser } from './auth/middleware.js'
import { CategoryService } from './assets/categoryService.js'
import { AssetService } from './assets/assetService.js'
import { 
  createCategorySchema, 
  updateCategorySchema,
  createAssetSchema,
  updateAssetSchema,
  assetFiltersSchema,
  AssetStatus,
  changeStatusSchema
} from './assets/schemas.js'

const app = Fastify()
await app.register(cors, { origin: true })

const prisma = new PrismaClient()

app.get('/health', async () => {
  return { ok: true }
})

// Auth routes
app.post('/auth/register', async (request, reply) => {
  try {
    const body = registerSchema.parse(request.body)
    const result = await registerUser(body)
    
    return reply.status(201).send({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    
    if (message === 'El usuario ya existe') {
      return reply.status(409).send({
        success: false,
        error: message
      })
    }
    
    return reply.status(400).send({
      success: false,
      error: message
    })
  }
})

app.post('/auth/login', async (request, reply) => {
  try {
    const body = loginSchema.parse(request.body)
    const result = await loginUser(body)
    
    return reply.send({
      success: true,
      message: 'Login exitoso',
      data: result
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    
    return reply.status(401).send({
      success: false,
      error: message
    })
  }
})

// Protected route example
app.get('/auth/me', { preHandler: authenticateUser }, async (request) => {
  return {
    success: true,
    data: {
      user: request.user
    }
  }
})

// ======================
// RUTAS DE CATEGORÍAS
// ======================

// Obtener todas las categorías
app.get('/categories', { preHandler: authenticateUser }, async () => {
  try {
    const categories = await CategoryService.getAllCategories()
    return { success: true, data: categories }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Obtener categoría por ID
app.get('/categories/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    const category = await CategoryService.getCategoryById(id)
    return { success: true, data: category }
  } catch (error: any) {
    reply.status(404)
    return { success: false, error: error.message }
  }
})

// Crear categoría
app.post('/categories', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const validatedData = createCategorySchema.parse(request.body)
    const category = await CategoryService.createCategory(validatedData)
    
    reply.status(201)
    return { success: true, data: category }
  } catch (error: any) {
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// Actualizar categoría
app.put('/categories/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    const validatedData = updateCategorySchema.parse(request.body)
    const category = await CategoryService.updateCategory(id, validatedData)
    
    return { success: true, data: category }
  } catch (error: any) {
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// Eliminar categoría
app.delete('/categories/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    console.log('🗑️ Intentando eliminar categoría con ID:', id)
    
    const result = await CategoryService.deleteCategory(id)
    console.log('✅ Categoría eliminada exitosamente:', result)
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Error al eliminar categoría:', error.message)
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// ======================
// RUTAS DE ACTIVOS
// ======================

// Obtener activos con filtros
app.get('/assets', { preHandler: authenticateUser }, async (request) => {
  try {
    const filters = assetFiltersSchema.parse(request.query)
    const result = await AssetService.getAssets(filters)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Crear activo
app.post('/assets', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const validatedData = createAssetSchema.parse(request.body)
    const userId = (request as any).user.userId
    const asset = await AssetService.createAsset(validatedData, userId)
    
    reply.status(201)
    return { success: true, data: asset }
  } catch (error: any) {
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// Obtener activo por ID
app.get('/assets/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    const asset = await AssetService.getAssetById(id)
    return { success: true, data: asset }
  } catch (error: any) {
    reply.status(404)
    return { success: false, error: error.message }
  }
})

// Obtener activo por código
app.get('/assets/code/:code', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { code } = request.params as { code: string }
    const asset = await AssetService.getAssetByCode(code)
    return { success: true, data: asset }
  } catch (error: any) {
    reply.status(404)
    return { success: false, error: error.message }
  }
})

// Actualizar activo
app.put('/assets/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    const validatedData = updateAssetSchema.parse(request.body)
    const asset = await AssetService.updateAsset(id, validatedData)
    
    return { success: true, data: asset }
  } catch (error: any) {
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// Cambiar estado del activo
app.patch('/assets/:id/status', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    const { status } = changeStatusSchema.parse(request.body)
    
    const asset = await AssetService.changeAssetStatus(id, status)
    return { success: true, data: asset }
  } catch (error: any) {
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// Eliminar activo
app.delete('/assets/:id', { preHandler: authenticateUser }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string }
    const result = await AssetService.deleteAsset(id)
    
    return { success: true, data: result }
  } catch (error: any) {
    reply.status(400)
    return { success: false, error: error.message }
  }
})

// Estadísticas de activos
app.get('/assets-stats', { preHandler: authenticateUser }, async () => {
  try {
    const stats = await AssetService.getAssetStats()
    return { success: true, data: stats }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

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