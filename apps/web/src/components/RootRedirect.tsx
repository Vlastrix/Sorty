import { useEffect } from 'react'
import { UserRole } from '@sorty/validators'

export default function RootRedirect() {
  useEffect(() => {
    // Detectar token directamente del localStorage
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      console.log('RootRedirect: No token, redirecting to login')
      window.location.replace('/login')
      return
    }

    // Intentar obtener el rol del usuario del token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userRole = payload.role as UserRole
      
      // Redirigir según el rol
      const targetPath = userRole === UserRole.ASSET_RESPONSIBLE ? '/my-assets' : '/assets'
      
      console.log('RootRedirect: User role:', userRole, 'redirecting to:', targetPath)
      window.location.replace(targetPath)
    } catch (error) {
      console.error('Error parsing token:', error)
      // Si hay error, redirigir a assets por defecto
      window.location.replace('/assets')
    }
  }, [])

  // Renderizar inmediatamente un loading simple
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: '48px',
            height: '48px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}
        />
        <p style={{ 
          marginTop: '16px', 
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Redirigiendo...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}