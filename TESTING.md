# 🧪 Guía de Pruebas - Sistema de Autenticación Frontend + Backend

## 🚀 Pasos para Probar la Integración Completa

### 1. Iniciar ambos servidores

**Terminal 1 - Backend API:**
```powershell
cd "c:\Vladi\Taller V Projects\sorty\apps\api"
pnpm dev
```
🌐 Backend disponible en: http://localhost:4000

**Terminal 2 - Frontend Web:**
```powershell
cd "c:\Vladi\Taller V Projects\sorty\apps\web"
pnpm dev
```
🌐 Frontend disponible en: http://localhost:5173

### 2. Flujo de Pruebas en el Navegador

#### 📝 **Registro de Usuario**
1. Ve a http://localhost:5173
2. Haz clic en "Registrarse" 
3. Completa el formulario:
   - Email: `test@ejemplo.com`
   - Contraseña: `123456`
   - Confirmar contraseña: `123456`
   - Rol: `admin` o `user`
4. Haz clic en "Crear Cuenta"
5. ✅ Deberías ser redirigido automáticamente a `/assets`

#### 🔐 **Cerrar Sesión y Login**
1. Haz clic en "Cerrar Sesión" en la parte superior derecha
2. Haz clic en "Iniciar Sesión"
3. Usa las mismas credenciales:
   - Email: `test@ejemplo.com`
   - Contraseña: `123456`
4. ✅ Deberías ser redirigido automáticamente a `/assets`

#### 🛡️ **Probar Rutas Protegidas**
1. En una nueva pestaña, intenta acceder directamente a: http://localhost:5173/assets
2. ✅ Sin estar autenticado, deberías ser redirigido a `/login`
3. Después de login, ✅ deberías ser redirigido de vuelta a `/assets`

#### 🔄 **Persistencia de Sesión**
1. Estando logueado, recarga la página (F5)
2. ✅ Deberías seguir autenticado (no redirigido a login)
3. Cierra y abre el navegador completamente
4. Ve a http://localhost:5173
5. ✅ Deberías seguir autenticado

## 🎯 Funcionalidades Implementadas

### ✅ **Backend (API)**
- ✅ Registro de usuarios con validación
- ✅ Login con verificación de credenciales  
- ✅ Hash seguro de contraseñas (Argon2)
- ✅ Generación y verificación de tokens JWT
- ✅ Middleware de autenticación para rutas protegidas
- ✅ Endpoint `/auth/me` para verificar usuario actual
- ✅ Rutas protegidas (ej: `/assets` requiere token)

### ✅ **Frontend (React)**
- ✅ Páginas de Login y Registro con UI moderna
- ✅ Context de autenticación global (`useAuth`)
- ✅ Rutas protegidas con redirección automática
- ✅ Persistencia de tokens en localStorage
- ✅ Manejo de errores y estados de carga
- ✅ Navegación condicional según estado de auth
- ✅ Cliente HTTP con manejo automático de tokens

## 🔍 Casos de Prueba Específicos

### ✅ **Validaciones**
- ✅ Email inválido → muestra error
- ✅ Contraseña < 6 caracteres → muestra error  
- ✅ Contraseñas no coinciden → muestra error
- ✅ Usuario ya existe → muestra error específico
- ✅ Credenciales incorrectas → muestra error

### ✅ **Estados de UI**
- ✅ Loading spinners durante requests
- ✅ Botones deshabilitados durante submit
- ✅ Mensajes de error claros y específicos
- ✅ Formularios se resetean tras errores

### ✅ **Seguridad**
- ✅ Tokens JWT con expiración (7 días)
- ✅ Headers Authorization automáticos
- ✅ Logout limpia tokens completamente
- ✅ Rutas protegidas verifican autenticación

## 🎨 **Interfaz de Usuario**

### Características del Diseño:
- ✅ Responsive (mobile-first)
- ✅ Tailwind CSS para estilos consistentes
- ✅ Estados hover y focus
- ✅ Iconos y feedback visual
- ✅ Colores y tipografía moderna

### Navegación:
- ✅ Header dinámico según estado de auth
- ✅ Links condicionales (Login/Register vs Usuario/Logout)
- ✅ Breadcrumbs y contexto visual

## 🚨 **Troubleshooting**

### Backend no responde:
```powershell
# Verificar que el servidor esté corriendo
curl http://localhost:4000/health
# O en PowerShell:
Invoke-RestMethod -Uri "http://localhost:4000/health"
```

### Frontend no carga:
- Verificar que Vite esté en http://localhost:5173
- Revisar la consola del navegador por errores
- Verificar variables de entorno en `.env`

### Problemas de CORS:
- El backend ya tiene CORS habilitado con `origin: true`
- Verificar que las URLs coincidan (localhost vs 127.0.0.1)

## 🎯 **Próximos Pasos**

Con el sistema de autenticación completamente funcional, puedes continuar con:

1. **CRUD de Activos** - Crear, editar, eliminar activos
2. **Gestión de Categorías** - CRUD para categorías
3. **Roles y Permisos** - Funcionalidades específicas por rol
4. **Dashboard** - Resumen y estadísticas
5. **Exportación** - PDF/Excel de reportes