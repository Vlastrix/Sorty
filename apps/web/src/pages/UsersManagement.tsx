import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole, RoleLabels, RoleDescriptions } from '@sorty/validators'
import { Button } from '../components/forms/Button'
import Icon from '../components/Icon'
import { ConfirmModal } from '../components/ConfirmModal'

interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  isActive: boolean
  createdAt: string
  _count?: {
    createdAssets: number
    assignedAssets: number
  }
}

export default function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Cargar usuarios
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:4000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      } else {
        setError(data.error || 'Error al cargar usuarios')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setShowDeleteModal(false)
        setUserToDelete(null)
        fetchUsers()
      } else {
        alert(data.error || 'Error al eliminar usuario')
      }
    } catch (err) {
      alert('Error de conexión')
      console.error(err)
    }
  }

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800'
      case UserRole.INVENTORY_MANAGER:
        return 'bg-blue-100 text-blue-800'
      case UserRole.ASSET_RESPONSIBLE:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900"><Icon name="user" /> Gestión de Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra usuarios y sus roles en el sistema
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total de usuarios: <span className="font-semibold">{users.length}</span>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + Crear Usuario
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {RoleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>Creados: {user._count?.createdAssets || 0}</span>
                      <span>Asignados: {user._count?.assignedAssets || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="relative group p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Icon name="edit" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Editar
                        </span>
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => confirmDeleteUser(user)}
                          className="relative group p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Icon name="trash" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Eliminar
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay usuarios registrados</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingUser) && (
          <UserFormModal
            user={editingUser}
            onClose={() => {
              setShowCreateModal(false)
              setEditingUser(null)
            }}
            onSuccess={() => {
              setShowCreateModal(false)
              setEditingUser(null)
              fetchUsers()
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          type="danger"
          title="Eliminar Usuario"
          message={userToDelete ? `¿Estás seguro de que deseas eliminar al usuario "${userToDelete.name || userToDelete.email}"? Esta acción no se puede deshacer.` : ''}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={() => userToDelete && handleDeleteUser(userToDelete.id)}
          onClose={() => {
            setShowDeleteModal(false)
            setUserToDelete(null)
          }}
        />
      </div>
    </div>
  )
}

// Modal para crear/editar usuario
interface UserFormModalProps {
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

function UserFormModal({ user, onClose, onSuccess }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    role: user?.role || UserRole.ASSET_RESPONSIBLE,
    isActive: user?.isActive ?? true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const url = user 
        ? `http://localhost:4000/users/${user.id}`
        : 'http://localhost:4000/users'
      
      const body: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        ...(user && { isActive: formData.isActive })
      }

      if (!user && formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method: user ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Error al guardar usuario')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-fade-in-scale">
        <h2 className="text-2xl font-bold mb-4">
          {user ? 'Editar Usuario' : 'Crear Usuario'}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {RoleLabels[role]} - {RoleDescriptions[role]}
                  </option>
                ))}
              </select>
            </div>

            {user && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Usuario activo
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
