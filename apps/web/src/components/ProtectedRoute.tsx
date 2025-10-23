import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '@sorty/validators'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  allowedRoles,
  fallbackPath
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Determinar la ruta de fallback según el rol del usuario
  const getDefaultFallback = () => {
    if (!user) return '/login'
    if (user.role === UserRole.ASSET_RESPONSIBLE) return '/my-assets'
    return '/assets'
  }

  const redirectPath = fallbackPath || getDefaultFallback()

  // Si requiere autenticación y no hay usuario, redirigir a login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si no requiere autenticación y hay usuario, redirigir a la página principal
  if (!requireAuth && user) {
    return <Navigate to={redirectPath} replace />
  }

  // Si se especifican roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Usuario no tiene permiso, redirigir con mensaje
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location, 
          error: 'No tienes permisos para acceder a esta página' 
        }} 
        replace 
      />
    )
  }

  return <>{children}</>
}