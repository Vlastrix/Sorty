import { useEffect } from 'react'

export default function RootRedirect() {
  useEffect(() => {
    // Detectar token directamente del localStorage
    const token = localStorage.getItem('auth_token')
    const targetPath = token ? '/assets' : '/login'
    
    console.log('RootRedirect: token exists?', !!token, 'redirecting to:', targetPath)
    
    // Usar window.location directamente para máxima compatibilidad
    window.location.replace(targetPath)
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