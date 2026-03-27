import { useState, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/services/notification.service'
import { UserRole } from '@wrcb/cb-common'

const EAS_PROJECT_ID = '1f09fc15-6da2-4596-973c-b44059cb2f6d'

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

    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token)
    })

    // Notificação recebida com app aberto
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        onPushReceived?.()
      })

    // Usuário clicou na notificação
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

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Push] Notificações push requerem dispositivo físico')
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Padrão',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permissão de notificação negada')
    return null
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: EAS_PROJECT_ID,
  })

  const token = tokenData.data

  // Envia token pro backend
  try {
    await notificationService.registerPushToken(token)
  } catch (error) {
    console.error('[Push] Erro ao registrar token no backend:', error)
  }

  return token
}
