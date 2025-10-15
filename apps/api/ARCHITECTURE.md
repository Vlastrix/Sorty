# 🏗️ Arquitectura del Backend - MVC Pattern

## 📁 Nueva Estructura

```
apps/api/src/
├── index.ts                          # 🚀 Punto de entrada (configuración de Fastify)
│
├── controllers/                      # 🎮 Controladores (manejan req/res)
│   ├── auth.controller.ts           # Autenticación
│   ├── assets.controller.ts         # Gestión de activos
│   └── categories.controller.ts     # Gestión de categorías
│
├── routes/                           # 🛣️ Definición de rutas
│   ├── auth.routes.ts               # Rutas de autenticación
│   ├── assets.routes.ts             # Rutas de activos
│   └── categories.routes.ts         # Rutas de categorías
│
├── auth/                             # 🔐 Módulo de autenticación
│   ├── service.ts                   # Lógica de negocio (register, login)
│   ├── middleware.ts                # Middleware de autenticación
│   ├── jwt.ts                       # Generación y verificación de tokens
│   └── schemas.ts                   # Validación con Zod
│
└── assets/                           # 📦 Módulo de activos
    ├── assetService.ts              # Lógica de negocio de activos
    ├── categoryService.ts           # Lógica de negocio de categorías
    └── schemas.ts                   # Validación con Zod
```

## 🔄 Flujo de una Petición

```
1. HTTP Request
   ↓
2. index.ts (Fastify enruta la petición)
   ↓
3. routes/*.routes.ts (Define la ruta y middleware)
   ↓
4. middleware (autenticación, validación)
   ↓
5. controllers/*.controller.ts (Maneja request/response)
   ↓
6. services/*.service.ts (Lógica de negocio)
   ↓
7. Prisma (Base de datos)
   ↓
8. HTTP Response
```

## 📋 Responsabilidades por Capa

### **index.ts** - Configuración
- ✅ Configurar Fastify
- ✅ Registrar plugins (CORS, etc.)
- ✅ Registrar rutas
- ✅ Iniciar servidor
- ❌ NO debe tener lógica de negocio
- ❌ NO debe manejar peticiones directamente

### **Routes** - Definición de Endpoints
- ✅ Definir URLs y métodos HTTP
- ✅ Aplicar middlewares (autenticación)
- ✅ Conectar con controladores
- ❌ NO debe tener validación
- ❌ NO debe tener lógica de negocio

**Ejemplo:**
```typescript
// routes/assets.routes.ts
export async function assetsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticateUser)
  
  app.get('/assets', AssetsController.getAll)
  app.post('/assets', AssetsController.create)
  app.put('/assets/:id', AssetsController.update)
}
```

### **Controllers** - Manejo de Request/Response
- ✅ Parsear y validar datos de entrada
- ✅ Llamar al servicio correspondiente
- ✅ Formatear y devolver respuesta
- ✅ Manejar errores HTTP (status codes)
- ❌ NO debe tener lógica de negocio
- ❌ NO debe interactuar con la BD directamente

**Ejemplo:**
```typescript
// controllers/assets.controller.ts
export class AssetsController {
  static async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createAssetSchema.parse(request.body)
      const userId = (request as any).user.userId
      const asset = await AssetService.createAsset(validatedData, userId)
      
      return reply.status(201).send({ success: true, data: asset })
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message })
    }
  }
}
```

### **Services** - Lógica de Negocio
- ✅ Implementar reglas de negocio
- ✅ Interactuar con la base de datos (Prisma)
- ✅ Validar datos a nivel de negocio
- ✅ Lanzar errores específicos
- ❌ NO debe conocer HTTP (request/response)
- ❌ NO debe manejar status codes

**Ejemplo:**
```typescript
// assets/assetService.ts
export class AssetService {
  static async createAsset(data: any, createdById: string) {
    try {
      const asset = await prisma.asset.create({
        data: { ...data, createdById },
        include: { category: true }
      })
      return asset
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe un activo con ese código')
      }
      throw error
    }
  }
}
```

## 🎯 Ventajas de esta Arquitectura

### ✅ **Separación de Responsabilidades**
- Cada capa tiene una función específica
- Fácil de entender qué hace cada archivo

### ✅ **Testeable**
```typescript
// Puedes testear el servicio sin HTTP
const asset = await AssetService.createAsset(mockData, userId)
expect(asset.code).toBe('ACT-001')
```

### ✅ **Reutilizable**
```typescript
// El mismo servicio puede usarse desde diferentes controladores
// o incluso desde scripts, cron jobs, etc.
```

### ✅ **Mantenible**
- Cambios en rutas → solo editar routes/
- Cambios en validación → solo editar controllers/
- Cambios en lógica → solo editar services/

### ✅ **Escalable**
- Agregar nuevas funcionalidades es fácil
- Cada módulo crece independientemente

## 🚀 Endpoints Disponibles

### Autenticación (`/auth`)
```
POST   /auth/register    - Registrar usuario
POST   /auth/login       - Iniciar sesión
GET    /auth/me          - Obtener perfil (requiere auth)
```

### Categorías
```
GET    /categories       - Listar todas
GET    /categories/:id   - Obtener por ID
POST   /categories       - Crear nueva
PUT    /categories/:id   - Actualizar
DELETE /categories/:id   - Eliminar
```

### Activos
```
GET    /assets           - Listar con filtros
POST   /assets           - Crear nuevo
GET    /assets/:id       - Obtener por ID
GET    /assets/code/:code - Obtener por código
PUT    /assets/:id       - Actualizar
PATCH  /assets/:id/status - Cambiar estado
DELETE /assets/:id       - Eliminar
GET    /assets-stats     - Estadísticas
```

## 🔒 Autenticación

Todas las rutas (excepto `/auth/register` y `/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 🧪 Testing

La arquitectura facilita crear tests:

```typescript
// Testear controlador (mock del servicio)
describe('AssetsController', () => {
  it('should create asset', async () => {
    const mockService = vi.spyOn(AssetService, 'createAsset')
    // ...
  })
})

// Testear servicio (mock de Prisma)
describe('AssetService', () => {
  it('should create asset in database', async () => {
    const mockPrisma = vi.spyOn(prisma.asset, 'create')
    // ...
  })
})
```

## 📝 Convenciones

### Nombres de Archivos
- `*.controller.ts` - Controladores
- `*.routes.ts` - Rutas
- `*Service.ts` - Servicios
- `*.schemas.ts` - Validaciones Zod

### Nombres de Clases
- `AuthController` - Controladores
- `AssetService` - Servicios

### Métodos
- Controladores y Servicios usan métodos `static`
- Nombres descriptivos: `getAll`, `create`, `update`, `delete`

## 🎨 Antes vs Después

### ❌ Antes (index.ts monolítico)
```typescript
// 277 líneas de código
// Todo mezclado
app.post('/assets', async (request, reply) => {
  // Validación + Lógica + Response todo junto
})
```

### ✅ Después (Arquitectura MVC)
```typescript
// index.ts - 40 líneas (solo config)
// routes - 15 líneas (solo rutas)
// controllers - 20 líneas (manejo HTTP)
// services - ya existían (lógica)
```

## 🔧 Próximos Pasos Recomendados

1. ✅ **Error Handling Centralizado**
   - Crear middleware de manejo de errores

2. ✅ **Validación con Decoradores**
   - Usar decoradores de Fastify para validación

3. ✅ **DTOs (Data Transfer Objects)**
   - Definir tipos específicos para request/response

4. ✅ **Logging Mejorado**
   - Integrar Winston o Pino más estructurado

5. ✅ **Rate Limiting**
   - Proteger endpoints de abuso

---

**Creado el:** 14 de Octubre, 2025  
**Patrón:** MVC (Model-View-Controller) adaptado para APIs
