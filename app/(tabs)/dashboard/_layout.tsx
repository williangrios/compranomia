// app/(tabs)/dashboard/_layout.tsx
import { Stack } from 'expo-router'

export default function DashboardLayout() {
  return (
    <Stack>
      {/* Dashboard (raiz) */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Loja',
        }}
      />

      <Stack.Screen
        name="products"
        options={{
          title: 'Produtos',
        }}
      />

      <Stack.Screen
        name="business-profile"
        options={{
          title: 'Perfil do negócio',
        }}
      />

      <Stack.Screen
        name="seller-settings"
        options={{
          title: 'Configurações do negócio',
        }}
      />
    </Stack>
  )
}
