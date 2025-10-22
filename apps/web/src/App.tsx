import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { UserRole } from '@sorty/validators'
import ProtectedRoute from './components/ProtectedRoute'
import RootRedirect from './components/RootRedirect'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import AssetsList from './pages/AssetsList'
import { AssetsDashboard } from './pages/AssetsDashboard'
import UsersManagement from './pages/UsersManagement'
import AssignmentHistory from './pages/AssignmentHistory'

function AppContent() {
  // Fallback adicional para navegadores problemáticos
  useEffect(() => {
    if (window.location.pathname === '/') {
      const token = localStorage.getItem('auth_token')
      const targetPath = token ? '/assets' : '/login'
      
      setTimeout(() => {
        if (window.location.pathname === '/') {
          console.log('App fallback redirect to:', targetPath)
          window.location.href = targetPath
        }
      }, 500)
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      
      {/* Public routes (only accessible when NOT logged in) */}
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
      
      {/* Protected routes with layout */}
      <Route 
        path="/assets" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <AssetsDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/assets-old" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <AssetsList />
              </div>
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Users management (only admin) */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requireAuth={true} allowedRoles={[UserRole.ADMIN]}>
            <Layout>
              <UsersManagement />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Assignment history (admin and inventory managers) */}
      <Route 
        path="/assignments" 
        element={
          <ProtectedRoute requireAuth={true} allowedRoles={[UserRole.ADMIN, UserRole.INVENTORY_MANAGER]}>
            <Layout>
              <AssignmentHistory />
            </Layout>
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