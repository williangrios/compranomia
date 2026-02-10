// app/_layout.tsx
import 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { AddressProvider } from '@/contexts/AddressContext' // ← ADICIONA
import { StatusBar } from 'expo-status-bar'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { CartProvider } from '@/contexts/CartContext'

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
    <AuthProvider>
      <AddressProvider>
        <NotificationProvider>
          <CartProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </CartProvider>
        </NotificationProvider>
      </AddressProvider>
    </AuthProvider>
  )
}
