import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { components } from '@/theme'

export function Header() {
  return (
    <View style={components.header.container}>
      <Pressable>
        <Text style={components.header.title}>
          R. Pref. José Roberto do Vale, 950 ↓
        </Text>
      </Pressable>

      <Pressable style={components.header.notificationButton}>
        <Ionicons
          name="notifications-outline"
          size={20}
          style={components.header.notificationIcon}
        />
      </Pressable>
    </View>
  )
}
