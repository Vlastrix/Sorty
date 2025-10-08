import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

// Función para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('user')
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
      await register(email, password, role)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              iniciar sesión con tu cuenta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
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
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  emailError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="user" className="bg-white text-gray-900">Usuario</option>
                <option value="admin" className="bg-white text-gray-900">Administrador</option>
              </select>
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}