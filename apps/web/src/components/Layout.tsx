import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { RoleLabels } from '@sorty/validators'
import Icon from './Icon'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, canManageUsers, canManageAssets } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 mr-8">
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
            </div>
            
            {/* Navigation Links */}
            <nav className="flex items-center space-x-2 flex-1 justify-center">
              {canManageAssets() ? (
                <Link 
                  to="/assets"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="box" /> Activos
                </Link>
              ) : (
                <Link 
                  to="/my-assets"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="box" /> Mis Activos
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/assignments"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="clipboard-list" /> Asignaciones
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/movements"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="boxes" /> Movimientos
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/maintenance"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="wrench" /> Mantenimiento
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/incidents"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="warning" /> Incidencias
                </Link>
              )}

              {canManageAssets() && (
                <Link 
                  to="/reports"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="chart-bar" /> Reportes
                </Link>
              )}
              
              {canManageUsers() && (
                <Link 
                  to="/users"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Icon name="user" /> Usuarios
                </Link>
              )}
            </nav>

            {/* User Info and Logout */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4 flex-shrink-0">
              <div className="text-right max-w-[180px]">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Usuario'}
                </div>
                {user?.role && (
                  <div className="text-xs text-blue-600 font-medium truncate">
                    {RoleLabels[user.role]}
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors flex-shrink-0"
                title="Cerrar Sesión"
              >
                <Icon name="sign-out" size="sm" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo NUR a la izquierda */}
            <div className="flex-shrink-0">
              <img
                src="/images/nur.png"
                alt="Universidad NUR"
                className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Copyright al centro */}
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} <span className="font-semibold text-blue-600">Team Sorty</span>. Todos los derechos reservados.
              </p>
            </div>

            {/* Espacio vacío a la derecha para balance */}
            <div className="flex-shrink-0 w-10"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
