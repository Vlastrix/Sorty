// API client configuration
import type { User as ValidatorUser, UserRole, LoginResponse } from '@sorty/validators'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:4000'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Export User type from validators
export type User = ValidatorUser

export interface AuthResponse {
  user: User
  token: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
      console.log('🔑 ApiClient: Sending request with token:', this.token.substring(0, 20) + '...')
    } else {
      console.log('<Icon name="times" className="inline" /> ApiClient: No token available for request to:', endpoint)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Si la respuesta no es ok, intentar obtener el mensaje de error
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async register(email: string, password: string, role: string = 'user', name?: string): Promise<ApiResponse<AuthResponse>> {
    const body: any = { email, password, role }
    if (name) {
      body.name = name
    }
    
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me')
  }

  // Assets endpoints
  async getAssets(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request<{ items: any[] }>('/assets')
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient(API_BASE_URL)