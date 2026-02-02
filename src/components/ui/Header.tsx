// components/ui/Header.tsx
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { components, colors } from '@/theme'
import { useAddress } from '@/contexts/AddressContext'
import { useNotifications } from '@/contexts/NotificationContext'

export function Header() {
  const router = useRouter()
  const { address } = useAddress()
  const { hasUnread } = useNotifications()

  const label = address ? `${address.street}, ${address.number}` : 'Selecione--'

  return (
    <View style={components.header.container}>
      <Pressable onPress={() => router.push('/addresses')}>
        <Text style={components.header.title}>{label}</Text>
      </Pressable>

      <Pressable
        style={components.header.notificationButton}
        onPress={() => router.push('/notifications')}
        hitSlop={10}
      >
        <Ionicons
          name={hasUnread ? 'notifications' : 'notifications-outline'}
          size={20}
          style={components.header.notificationIcon}
        />
        {hasUnread && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.danger,
              borderWidth: 2,
              borderColor: colors.background,
            }}
          />
        )}
      </Pressable>
    </View>
  )
}
