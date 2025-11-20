import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerUser, loginUser } from '@/auth/service'
import { mockPrisma, mockArgon2, mockJWT } from '../setup'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'ASSET_RESPONSIBLE' as const
    }

    it('should register a new user successfully', async () => {
      // Arrange
      const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$salt$hash'
      const mockToken = 'mock-jwt-token-12345'
      const mockUser = {
        id: 'user-123',
        email: validUserData.email,
        password: hashedPassword,
        role: validUserData.role,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      }

      // Setup mocks
      mockPrisma.user.findUnique.mockResolvedValue(null) // Usuario no existe
      mockArgon2.hash.mockResolvedValue(hashedPassword)
      mockPrisma.user.create.mockResolvedValue(mockUser)
      mockJWT.generateToken.mockReturnValue(mockToken)

      // Act
      const result = await registerUser(validUserData)

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validUserData.email }
      })
      expect(mockArgon2.hash).toHaveBeenCalledWith(validUserData.password)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: validUserData.email,
          password: hashedPassword,
          role: validUserData.role
        }
      })
      expect(mockJWT.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      })

      // Verificar resultado
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt
        },
        token: mockToken
      })
    })

    it('should throw error when user already exists', async () => {
      // Arrange
      const existingUser = {
        id: 'existing-user',
        email: validUserData.email,
        password: 'hashed-password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      // Act & Assert
      await expect(registerUser(validUserData)).rejects.toThrow('El usuario ya existe')
      
      // Verificar que no se intentó crear el usuario
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
      expect(mockArgon2.hash).not.toHaveBeenCalled()
    })

    it('should handle argon2 hash errors', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockArgon2.hash.mockRejectedValue(new Error('Hashing failed'))

      // Act & Assert
      await expect(registerUser(validUserData)).rejects.toThrow('Hashing failed')
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('should handle database creation errors', async () => {
      // Arrange
      const hashedPassword = '$argon2id$hashed'
      
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockArgon2.hash.mockResolvedValue(hashedPassword)
      mockPrisma.user.create.mockRejectedValue(new Error('Database connection failed'))

      // Act & Assert
      await expect(registerUser(validUserData)).rejects.toThrow('Database connection failed')
    })

    it('should use default role "user" when not specified', async () => {
      // Arrange
      const userDataWithoutRole = {
        email: 'test@example.com',
        password: 'password123'
        // sin role
      }

      const hashedPassword = '$argon2id$hashed'
      const mockUser = {
        id: 'user-123',
        email: userDataWithoutRole.email,
        password: hashedPassword,
        role: 'ASSET_RESPONSIBLE', // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockArgon2.hash.mockResolvedValue(hashedPassword)
      mockPrisma.user.create.mockResolvedValue(mockUser)
      mockJWT.generateToken.mockReturnValue('token')

      // Act
      await registerUser(userDataWithoutRole as any)

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userDataWithoutRole.email,
          name: undefined,
          password: hashedPassword,
          role: 'ASSET_RESPONSIBLE' // Verificar que se use ASSET_RESPONSIBLE por defecto
        }
      })
    })
  })

  describe('loginUser', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    it('should login successfully with correct credentials', async () => {
      // Arrange
      const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$salt$hash'
      const mockToken = 'mock-jwt-token-67890'
      const mockUser = {
        id: 'user-456',
        email: validLoginData.email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      }

      // Setup mocks
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockArgon2.verify.mockResolvedValue(true)
      mockJWT.generateToken.mockReturnValue(mockToken)

      // Act
      const result = await loginUser(validLoginData)

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginData.email }
      })
      expect(mockArgon2.verify).toHaveBeenCalledWith(hashedPassword, validLoginData.password)
      expect(mockJWT.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      })

      // Verificar resultado
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt
        },
        token: mockToken
      })
    })

    it('should throw error when user does not exist', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(loginUser(validLoginData)).rejects.toThrow('Credenciales inválidas')
      
      // Verificar que no se intentó verificar la contraseña
      expect(mockArgon2.verify).not.toHaveBeenCalled()
      expect(mockJWT.generateToken).not.toHaveBeenCalled()
    })

    it('should throw error when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-789',
        email: validLoginData.email,
        password: 'hashed-correct-password',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockArgon2.verify.mockResolvedValue(false) // Contraseña incorrecta

      // Act & Assert
      await expect(loginUser(validLoginData)).rejects.toThrow('Credenciales inválidas')
      
      // Verificar que se intentó verificar la contraseña
      expect(mockArgon2.verify).toHaveBeenCalledWith(mockUser.password, validLoginData.password)
      
      // Pero no se generó token
      expect(mockJWT.generateToken).not.toHaveBeenCalled()
    })

    it('should handle argon2 verification errors', async () => {
      // Arrange
      const mockUser = {
        id: 'user-error',
        email: validLoginData.email,
        password: 'invalid-hash-format',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockArgon2.verify.mockRejectedValue(new Error('Invalid hash format'))

      // Act & Assert
      await expect(loginUser(validLoginData)).rejects.toThrow('Invalid hash format')
    })

    it('should handle database query errors', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection lost'))

      // Act & Assert
      await expect(loginUser(validLoginData)).rejects.toThrow('Database connection lost')
      expect(mockArgon2.verify).not.toHaveBeenCalled()
    })
  })

  describe('Security Tests', () => {
    it('should not return password in register response', async () => {
      // Arrange
      const userData = {
        email: 'security@test.com',
        password: 'supersecret123',
        role: 'ADMIN' as const
      }

      const mockUser = {
        id: 'sec-user',
        email: userData.email,
        password: '$argon2id$hashed$password',
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockArgon2.hash.mockResolvedValue('$argon2id$hashed$password')
      mockPrisma.user.create.mockResolvedValue(mockUser)
      mockJWT.generateToken.mockReturnValue('secure-token')

      // Act
      const result = await registerUser(userData)

      // Assert
      expect(result.user).not.toHaveProperty('password')
      expect(result.user.email).toBe(userData.email)
      expect(result.token).toBeDefined()
    })

    it('should not return password in login response', async () => {
      // Arrange
      const loginData = {
        email: 'security@test.com',
        password: 'supersecret123'
      }

      const mockUser = {
        id: 'sec-user',
        email: loginData.email,
        password: '$argon2id$hashed$password',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockArgon2.verify.mockResolvedValue(true)
      mockJWT.generateToken.mockReturnValue('secure-token')

      // Act
      const result = await loginUser(loginData)

      // Assert
      expect(result.user).not.toHaveProperty('password')
      expect(result.user.email).toBe(loginData.email)
      expect(result.token).toBeDefined()
    })
  })
})