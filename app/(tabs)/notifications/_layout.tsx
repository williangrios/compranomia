// app/(tabs)/notifications/_layout.tsx
import { Stack } from 'expo-router'

export default function NotificationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Notificações',
        }}
      />
    </Stack>
  )
}
