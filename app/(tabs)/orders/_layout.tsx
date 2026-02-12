// app/(tabs)/sales/_layout.tsx
import { Stack } from 'expo-router'

export default function SalesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Compras',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/chat"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}
