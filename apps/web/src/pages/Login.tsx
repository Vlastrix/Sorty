import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, error, clearError, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  


  // Get the page user was trying to visit, or default to assets
  const from = (location.state as any)?.from?.pathname || '/assets'

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await login(email, password)
      // Navigation will happen automatically due to useEffect above
    } catch (err) {
      // Error is handled by the context and will be displayed automatically
      console.error('Login failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo de la NUR - Fuera del contenedor */}
      <div className="mb-8 animate-fade-in-scale" style={{animationDelay: '0.1s', opacity: 0}}>
        <img
          src="/images/nur.png"
          alt="Universidad NUR"
          className="h-20 w-auto drop-shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        {/* Fallback si no hay logo */}
        <div className="h-20 w-20 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl hidden">
          <span className="text-blue-600 font-bold text-xl">NUR</span>
        </div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 animate-fade-in-up">
          {/* Logo de Sorty */}
          <div className="text-center -mt-10">
            <div className="animate-fade-in-scale" style={{animationDelay: '0.3s', opacity: 0}}>
              <img
                src="/images/logo.png"
                alt="Sorty"
                className="mx-auto h-48 w-auto -mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              {/* Fallback si no hay logo */}
              <div className="mx-auto h-48 w-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hidden">
                <span className="text-white font-bold text-6xl">S</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 -mt-5 animate-slide-in-left" style={{animationDelay: '0.4s', opacity: 0}}>
              Bienvenido a Sorty
            </h2>
            <p className="text-gray-600 mb-6 animate-slide-in-left" style={{animationDelay: '0.5s', opacity: 0}}>
              Sistema de Gestión de Inventarios
            </p>
          </div>

          {/* Título de la sección */}
          <div className="text-center animate-slide-in-left" style={{animationDelay: '0.6s', opacity: 0}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Iniciar Sesión
            </h3>
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

        <form className="space-y-6 animate-slide-in-left" style={{animationDelay: '0.7s', opacity: 0}} onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Limpiar error solo cuando el usuario escriba algo
                  if (error) {
                    clearError()
                  }
                }}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  // Limpiar error solo cuando el usuario escriba algo
                  if (error) {
                    clearError()
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}