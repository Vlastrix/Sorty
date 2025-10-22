import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { UserRole, RoleLabels } from '@sorty/validators'

// Función para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  
  const { register, error, clearError, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/assets', { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLocalError(null)
    setEmailError(null)
    
    if (!email || !password || !confirmPassword) {
      setLocalError('Todos los campos son requeridos')
      return
    }

    if (!isValidEmail(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido')
      setLocalError('Por favor corrige los errores antes de continuar')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)
    
    try {
      await register(email, password, UserRole.ASSET_RESPONSIBLE)
      // Navigation will happen automatically due to useEffect above
    } catch (err) {
      // Error is handled by the context
      console.error('Registration failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-6 animate-fade-in-up">
        {/* Logo y título principal */}
        <div className="text-center">
          <div className="mb-6 animate-fade-in-scale" style={{animationDelay: '0.2s', opacity: 0}}>
            <img
              src="/images/nur.png"
              alt="Universidad NUR"
              className="mx-auto h-24 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Fallback si no hay logo */}
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center hidden">
              <span className="text-white font-bold text-2xl">NUR</span>
            </div>
          </div>
        </div>

        {/* Título de la sección */}
        <div className="text-center animate-slide-in-left" style={{animationDelay: '0.4s', opacity: 0}}>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Crear Cuenta
          </h3>
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className="space-y-6 animate-slide-in-left" style={{animationDelay: '0.5s', opacity: 0}} onSubmit={onSubmit}>
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
                className={`mt-1 block w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  emailError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value
                  setEmail(newEmail)
                  
                  // Limpiar errores cuando el usuario escriba
                  if (error || localError) {
                    clearError()
                    setLocalError(null)
                  }
                  
                  // Validar email en tiempo real (solo si ya escribió algo)
                  if (newEmail.length > 0) {
                    if (!isValidEmail(newEmail)) {
                      setEmailError('Ingresa un correo electrónico válido')
                    } else {
                      setEmailError(null)
                    }
                  } else {
                    setEmailError(null)
                  }
                }}
                disabled={isSubmitting}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error || localError) {
                    clearError()
                    setLocalError(null)
                  }
                }}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (error || localError) {
                    clearError()
                    setLocalError(null)
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {displayError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de registro
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{displayError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !email || !password || !confirmPassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}