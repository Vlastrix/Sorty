# Sistema de Roles - Implementación Completa

## ✅ Backend Implementado

### 1. Base de Datos (Prisma)
- **Enum UserRole**: ADMIN, INVENTORY_MANAGER, ASSET_RESPONSIBLE
- **Modelo User actualizado**:
  - Campo `role` con tipo UserRole
  - Campo `name` para nombre completo
  - Campo `isActive` para activar/desactivar usuarios
  - Relación con activos asignados

- **Modelo Asset actualizado**:
  - Campo `assignedToId` para asignar responsable
  - Campo `assignedAt` para fecha de asignación
  - Relación con usuario asignado

### 2. Sistema de Permisos (`auth/roles.ts`)
- Constantes de roles
- Matriz de permisos por rol
- Funciones de utilidad:
  - `hasPermission(role, resource, action)`
  - `canManageAssets(role)`
  - `canManageUsers(role)`
  - `canViewAllAssets(role)`

### 3. Middleware de Autenticación (`auth/middleware.ts`)
- `authenticateUser`: Verifica JWT
- `requireRole(roles)`: Requiere roles específicos
- `requirePermission(resource, action)`: Requiere permisos específicos
- `requireAdmin`: Solo administradores
- `requireInventoryAccess`: Admin o Inventory Manager

### 4. Servicio de Usuarios (`auth/userService.ts`)
- `getAllUsers()`: Listar todos los usuarios
- `getUserById(id)`: Obtener usuario por ID
- `createUser(data)`: Crear nuevo usuario
- `updateUser(id, data)`: Actualizar usuario
- `updateUserPassword(userId, data)`: Cambiar contraseña
- `deleteUser(id, requestingUserId)`: Eliminar/desactivar usuario
- `getResponsibleUsers()`: Usuarios para asignar activos
- `getUserAssignedAssets(userId)`: Activos de un usuario

### 5. Controlador y Rutas de Usuarios
**Rutas** (`routes/users.routes.ts`):
- `GET /users` - Listar usuarios (admin)
- `GET /users/:id` - Usuario por ID (admin)
- `POST /users` - Crear usuario (admin)
- `PUT /users/:id` - Actualizar usuario (admin)
- `DELETE /users/:id` - Eliminar usuario (admin)
- `GET /users/responsibles` - Usuarios para asignar (admin/inventory)
- `PUT /users/me/password` - Cambiar mi contraseña (cualquiera)
- `GET /users/:id/assets` - Activos asignados

### 6. Datos de Prueba (`scripts/seedUsers.js`)
Usuarios creados:
- **admin@sorty.com** (ADMIN) - Gestión total
- **inventario@sorty.com** (INVENTORY_MANAGER) - Gestión de activos
- **responsable1@sorty.com** (ASSET_RESPONSIBLE) - Solo visualización
- **responsable2@sorty.com** (ASSET_RESPONSIBLE) - Solo visualización

**Contraseña para todos**: `password123`

## 📋 Permisos por Rol

### ADMIN (Administrador)
✅ Gestión total del sistema
- Crear, ver, editar y eliminar usuarios
- Gestionar roles de usuarios
- Crear, ver, editar y eliminar activos
- Asignar activos a responsables
- Ver todos los activos
- Gestión de categorías
- Generar reportes completos

### INVENTORY_MANAGER (Encargado de Inventario)
✅ Gestión de inventario
- Ver usuarios (para asignar activos)
- Crear, ver, editar y eliminar activos
- Asignar activos a responsables
- Ver todos los activos
- Crear y editar categorías
- Generar reportes

❌ No puede:
- Crear o eliminar usuarios
- Cambiar roles de usuarios
- Eliminar categorías

### ASSET_RESPONSIBLE (Responsable de Activo)
✅ Visualización limitada
- Ver activos asignados a él
- Ver categorías
- Solicitar mantenimiento (futuro)

❌ No puede:
- Ver o gestionar usuarios
- Crear o editar activos
- Ver activos de otros usuarios
- Gestionar categorías
- Generar reportes

## 🔧 Próximos Pasos

### Frontend Pendiente:
1. ✅ Actualizar AuthContext con funciones de permisos
2. ⏳ Actualizar ProtectedRoute para roles
3. ⏳ Crear página de gestión de usuarios (admin)
4. ⏳ Actualizar UI según permisos de rol
5. ⏳ Mostrar/ocultar botones según rol

## 🧪 Cómo Probar

### 1. Asegúrate de tener los datos de prueba:
```bash
cd apps/api
node src/scripts/seedUsers.js
node src/scripts/seedCategories.js
node src/scripts/seedAssets.js
```

### 2. Prueba los endpoints:

**Login como Admin:**
```bash
POST http://localhost:4000/auth/login
{
  "email": "admin@sorty.com",
  "password": "password123"
}
```

**Listar usuarios (requiere admin):**
```bash
GET http://localhost:4000/users
Headers: Authorization: Bearer YOUR_TOKEN
```

**Obtener usuarios responsables (admin o inventory):**
```bash
GET http://localhost:4000/users/responsibles
Headers: Authorization: Bearer YOUR_TOKEN
```

### 3. Verifica permisos:
- Login como admin → Debe poder acceder a `/users`
- Login como inventario → NO debe poder acceder a `/users` pero sí a `/users/responsibles`
- Login como responsable → NO debe poder acceder a ninguna ruta de usuarios

## 📝 Notas Técnicas

- Los tipos están sincronizados entre backend y frontend via `@sorty/validators`
- El sistema usa JWT para autenticación
- Los permisos se verifican tanto en frontend (UI) como backend (API)
- Los usuarios con activos creados solo se desactivan, no se eliminan
- Los usuarios con activos asignados no se pueden eliminar
