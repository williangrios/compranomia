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
        name="business-address"
        options={{
          title: 'Endereço do negócio',
        }}
      />

      <Stack.Screen
        name="seller-settings"
        options={{
          title: 'Configurações do negócio',
        }}
      />

      {/* ===== Produtos ===== */}
      <Stack.Screen
        name="products/index"
        options={{
          title: 'Meus produtos',
        }}
      />

      <Stack.Screen
        name="products/add"
        options={{
          title: 'Adicionar produto',
        }}
      />

      <Stack.Screen
        name="products/new"
        options={{
          title: 'Adicionar produto',
        }}
      />

      <Stack.Screen
        name="products/adopt"
        options={{
          title: 'Adicionar produto',
        }}
      />

      <Stack.Screen
        name="products/search"
        options={{
          title: 'Buscar produto',
        }}
      />

      <Stack.Screen
        name="products/edit/[id]"
        options={{
          title: 'Editar produto',
        }}
      />
    </Stack>
  )
}
