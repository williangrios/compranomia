// app/(tabs)/profile/_layout.tsx
import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack>
      {/* Perfil (raiz) */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Perfil',
          headerBackVisible: false,
        }}
      />

      {/* ===== Endereços ===== */}
      <Stack.Screen
        name="addresses/index"
        options={{
          title: 'Endereços',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="addresses/add"
        options={{
          title: 'Adicionar endereço',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="addresses/edit/[id]"
        options={{
          title: 'Editar endereço',
          headerBackVisible: true,
        }}
      />

      {/* ===== Dados pessoais ===== */}
      <Stack.Screen
        name="personal-data"
        options={{
          title: 'Dados pessoais',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="update-password"
        options={{
          title: 'Alterar senha',
          headerBackVisible: true,
        }}
      />

      {/* ===== Seller ===== */}
      <Stack.Screen
        name="business-profile"
        options={{
          title: 'Perfil do negócio',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="seller-settings"
        options={{
          title: 'Configurações do vendedor',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="store-address"
        options={{
          title: 'Endereço da loja',
          headerBackVisible: true,
        }}
      />
    </Stack>
  )
}
