import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient, type User, type AuthResponse } from '../lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiClient.getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.getMe()
        if (response.success && response.data?.user) {
          setUser(response.data.user)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        // Token is invalid, remove it
        apiClient.setToken(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.login(email, password)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        apiClient.setToken(token)
        setUser(user)
        setLoading(false) // Éxito - terminar loading
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err) {
      setLoading(false) // Error - terminar loading inmediatamente
      
      let message = 'Correo electrónico o contraseña incorrectos'
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase()
        
        // Manejar diferentes tipos de errores
        if (errorMessage.includes('credenciales inválidas') || 
            errorMessage.includes('invalid credentials') ||
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('401')) {
          message = 'Correo electrónico o contraseña incorrectos'
        } else if (errorMessage.includes('network') || 
                   errorMessage.includes('fetch') ||
                   errorMessage.includes('failed to fetch')) {
          message = 'Error de conexión. Verifica tu conexión a internet'
        } else if (errorMessage.includes('500')) {
          message = 'Error del servidor. Intenta más tarde'
        } else if (errorMessage.includes('timeout')) {
          message = 'Tiempo de espera agotado. Intenta nuevamente'
        }
      }
      
      setError(message)
      throw err // Lanzar el error original
    }
  }

  const register = async (email: string, password: string, role: string = 'user') => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.register(email, password, role)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        apiClient.setToken(token)
        setUser(user)
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (err) {
      let message = 'Error inesperado al registrar usuario'
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase()
        
        // Manejar diferentes tipos de errores
        if (errorMessage.includes('el usuario ya existe') || 
            errorMessage.includes('user already exists') ||
            errorMessage.includes('email already exists') ||
            errorMessage.includes('conflict') ||
            errorMessage.includes('409')) {
          message = 'Ya existe una cuenta con este correo electrónico'
        } else if (errorMessage.includes('email inválido') || 
                   errorMessage.includes('invalid email')) {
          message = 'El formato del correo electrónico no es válido'
        } else if (errorMessage.includes('contraseña') || 
                   errorMessage.includes('password')) {
          message = 'La contraseña debe tener al menos 6 caracteres'
        } else if (errorMessage.includes('network') || 
                   errorMessage.includes('fetch') ||
                   errorMessage.includes('failed to fetch')) {
          message = 'Error de conexión. Verifica tu conexión a internet'
        } else if (errorMessage.includes('500')) {
          message = 'Error del servidor. Intenta más tarde'
        } else {
          // Para cualquier otro error, usar el mensaje original si es útil
          message = err.message || 'Error al crear la cuenta'
        }
      }
      
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    apiClient.setToken(null)
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}