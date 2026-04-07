import { useState, useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/services/notification.service'
import { registerPushToken } from '@/utils/registerPushToken'
import { UserRole } from '@wrcb/cb-common'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function usePushNotifications(onPushReceived?: () => void) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<Notifications.Subscription>(null)
  const responseListener = useRef<Notifications.Subscription>(null)
  const router = useRouter()
  const { user } = useAuth()

  const previousUserIdRef = useRef<string | null>(null)

  // Remove token quando o usuário desloga
  useEffect(() => {
    const previousUserId = previousUserIdRef.current
    previousUserIdRef.current = user?.id ?? null

    // Usuário deslogou (tinha user antes, agora não tem)
    if (previousUserId && !user && expoPushToken) {
      notificationService
        .removePushToken(expoPushToken)
        .then(() => setExpoPushToken(null))
        .catch((err) => console.error('[Push] Erro ao remover token:', err))
    }
  }, [user?.id])

  useEffect(() => {
    if (!user || !user.isEmailVerified) return

    registerPushToken()
      .then((token) => {
        if (token) setExpoPushToken(token)
      })
      .catch((err) => console.error('[Push] Erro ao registrar token:', err))

    // Cold start: app foi aberto pelo toque na notificação
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data
        handleNotificationNavigation(data)
      }
    })

    // Notificação recebida com app aberto
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        onPushReceived?.()
      })

    // Usuário clicou na notificação (app em background)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data
        handleNotificationNavigation(data)
      })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [user?.id, user?.isEmailVerified])

  function handleNotificationNavigation(data: Record<string, any>) {
    if (!data) return

    const { subject, subjectId, destinationRole } = data

    if (!subjectId) {
      router.navigate('/(tabs)/notifications')
      return
    }

    if (destinationRole === UserRole.Consumer) {
      if (subject === 'OrderMessageSent') {
        router.navigate(`/(tabs)/orders/${subjectId}/chat`)
      } else {
        router.navigate(`/(tabs)/orders/${subjectId}`)
      }
    } else if (destinationRole === UserRole.Seller) {
      if (subject === 'OrderMessageSent') {
        router.navigate(`/(tabs)/sales/${subjectId}/chat`)
      } else {
        router.navigate(`/(tabs)/sales/${subjectId}`)
      }
    } else {
      router.navigate('/(tabs)/notifications')
    }
  }

  return { expoPushToken }
}
