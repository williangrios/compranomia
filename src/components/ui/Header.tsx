// components/ui/Header.tsx
import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { components, colors } from '@/theme'
import { useAddress } from '@/contexts/AddressContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { AddressSelectorModal } from '@/components/modals/AddressSelectorModal'

export function Header() {
  const router = useRouter()
  const { address } = useAddress()
  const { hasUnread } = useNotifications()
  const [modalVisible, setModalVisible] = useState(false)

  // Trunca o endereço se for muito longo
  const truncateAddress = (addr: typeof address) => {
    if (!addr) return 'Selecione o endereço'

    const fullAddress = `${addr.street}, ${addr.number}`
    const maxLength = 25

    if (fullAddress.length > maxLength) {
      return fullAddress.substring(0, maxLength) + '...'
    }

    return fullAddress
  }

  const displayAddress = truncateAddress(address)

  return (
    <>
      <View style={components.header.container}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 12,
          }}
          hitSlop={8}
        >
          <Ionicons
            name="location"
            size={18}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[components.header.title, { flex: 1 }]}
            numberOfLines={1}
          >
            {displayAddress}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
            style={{ marginLeft: 4 }}
          />
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

      {/* Modal de seleção de endereços */}
      <AddressSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  )
}
