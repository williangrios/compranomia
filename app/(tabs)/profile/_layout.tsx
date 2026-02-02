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
        }}
      />

      {/* ===== Endereços ===== */}
      <Stack.Screen
        name="addresses/index"
        options={{
          title: 'Endereços',
        }}
      />

      <Stack.Screen
        name="addresses/add"
        options={{
          title: 'Adicionar endereço',
        }}
      />

      <Stack.Screen
        name="addresses/edit/[id]"
        options={{
          title: 'Editar endereço',
        }}
      />

      {/* ===== Dados pessoais ===== */}
      <Stack.Screen
        name="personal-data"
        options={{
          title: 'Dados pessoais',
        }}
      />

      <Stack.Screen
        name="update-password"
        options={{
          title: 'Alterar senha',
        }}
      />

      {/* ===== Seller ===== */}
      <Stack.Screen
        name="business-profile"
        options={{
          title: 'Perfil do negócio',
        }}
      />

      <Stack.Screen
        name="seller-settings"
        options={{
          title: 'Configurações do vendedor',
        }}
      />
      <Stack.Screen
        name="store-address"
        options={{
          title: 'Endereço da loja',
        }}
      />
    </Stack>
  )
}
