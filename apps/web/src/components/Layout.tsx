import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { RoleLabels } from '@sorty/validators'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, canManageUsers, canManageAssets } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/assets" className="flex items-center hover:opacity-80 transition-opacity duration-200">
              <img 
                src="/images/logo.png" 
                alt="Sorty Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-2xl font-bold text-blue-600 -ml-2">
                Sorty
              </span>
            </Link>
            
            <nav className="flex items-center space-x-4 ml-8">
              {canManageAssets() ? (
                <Link 
                  to="/assets"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  📦 Activos
                </Link>
              ) : (
                <Link 
                  to="/my-assets"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  📦 Mis Activos
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/assignments"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  📋 Asignaciones
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/movements"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  📥📤 Movimientos
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/maintenance"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  🔧 Mantenimiento
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/incidents"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ⚠️ Incidencias
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/reports"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  📊 Reportes
                </Link>
              )}
              
              {canManageUsers() && (
                <Link 
                  to="/users"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  👥 Usuarios
                </Link>
              )}
              
              <div className="flex items-center space-x-4 ml-4 border-l pl-4">
                <div className="text-sm">
                  <div className="text-gray-600">
                    {user?.name || user?.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user?.role && RoleLabels[user.role]}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
