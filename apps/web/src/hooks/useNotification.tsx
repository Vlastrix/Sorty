import { useState, useCallback } from 'react'
import { Notification, NotificationType } from '../components/Notification'

interface NotificationData {
  id: number
  message: string
  type: NotificationType
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [nextId, setNextId] = useState(0)

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = nextId
    setNextId(prev => prev + 1)
    setNotifications(prev => [...prev, { id, message, type }])
  }, [nextId])

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const NotificationContainer = useCallback(() => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  ), [notifications, removeNotification])

  return {
    showNotification,
    NotificationContainer
  }
}
