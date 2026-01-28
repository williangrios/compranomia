import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { components } from '@/theme'
import { useAddress } from '@/contexts/AddressContext'

export function Header() {
  const router = useRouter()
  const { address } = useAddress()

  const label = address
    ? `${address.street}, ${address.number}`
    : 'Selecione um endereço ↓'

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
          name="notifications-outline"
          size={20}
          style={components.header.notificationIcon}
        />
      </Pressable>
    </View>
  )
}
