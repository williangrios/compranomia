import 'react-native-gesture-handler'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { AddressProvider } from '@/contexts/AddressContext'
import { StatusBar } from 'expo-status-bar'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { CartProvider } from '@/contexts/CartContext'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@/theme/toast.config'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await SplashScreen.hideAsync()
    }
    prepare()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AddressProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <Toast config={toastConfig} />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </AddressProvider>
    </GestureHandlerRootView>
  )
}
