import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Perfil..' }} />

      <Stack.Screen name="addresses" options={{ title: 'Endereços' }} />

      <Stack.Screen
        name="personal-data"
        options={{ title: 'Dados pessoais' }}
      />

      <Stack.Screen
        name="business-profile"
        options={{ title: 'Perfil comercial' }}
      />

      <Stack.Screen
        name="seller-settings"
        options={{ title: 'Configurações do vendedor' }}
      />
    </Stack>
  )
}
