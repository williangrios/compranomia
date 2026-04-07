import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { notificationService } from '@/services/notification.service'

const EAS_PROJECT_ID = '1f09fc15-6da2-4596-973c-b44059cb2f6d'

export async function registerPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
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

  await notificationService.registerPushToken(token)

  return token
}
