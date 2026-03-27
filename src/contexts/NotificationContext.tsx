// contexts/NotificationContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { notificationService } from '@/services/notification.service'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface NotificationContextValue {
  hasUnread: boolean
  refreshUnread: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue>({
  hasUnread: false,
  refreshUnread: async () => {},
})

const POLL_INTERVAL_MS = 60_000 // 1 minuto

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [hasUnread, setHasUnread] = useState(false)

  const refreshUnread = useCallback(async () => {
    try {
      const { hasUnread } = await notificationService.hasUnread()
      setHasUnread(hasUnread)
    } catch {
      // silenciar — não quebra a UI
    }
  }, [])

  // Push notifications — atualiza badge quando chega push
  usePushNotifications(refreshUnread)

  useEffect(() => {
    // Busca inicial
    refreshUnread()

    // Polling a cada POLL_INTERVAL_MS
    const interval = setInterval(refreshUnread, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refreshUnread])

  return (
    <NotificationContext.Provider value={{ hasUnread, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
