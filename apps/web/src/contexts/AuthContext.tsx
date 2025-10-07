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
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
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
      const message = err instanceof Error ? err.message : 'Registration failed'
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