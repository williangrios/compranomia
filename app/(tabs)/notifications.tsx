import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { colors } from '@/theme'

export default function Notifications() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notificações',
          headerShown: true,
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Nenhuma notificação por enquanto</Text>
      </View>
    </>
  )
}
