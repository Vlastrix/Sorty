import { Route, Routes, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import AssetsList from './pages/AssetsList'

function AppContent() {
  const { user, logout } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/assets" />} />
      
      {/* Public routes (only accessible when NOT logged in) - No layout */}
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected routes (only accessible when logged in) - With layout */}
      <Route 
        path="/assets" 
        element={
          <ProtectedRoute requireAuth={true}>
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
                    
                    <nav className="flex items-center space-x-4">
                      <Link 
                        to="/assets"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Activos
                      </Link>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Hola, {user?.email}
                        </span>
                        <button
                          onClick={logout}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </nav>
                  </div>
                </div>
              </header>

              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <AssetsList />
              </main>
            </div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}