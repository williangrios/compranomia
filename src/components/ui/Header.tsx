// components/ui/Header.tsx
import { useState } from 'react'
import { View, Text, Pressable, Image } from 'react-native'
import { Icon } from '@/components/ui/Icon'
import { useRouter } from 'expo-router'
import { components, colors } from '@/theme'
import { useAddress } from '@/contexts/AddressContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { AddressSelectorModal } from '@/components/modals/AddressSelectorModal'
import { headerStyles as styles } from '@/styles/header.styles'

export function Header() {
  const router = useRouter()
  const logo = require('../../../assets/logo.png')
  const { address } = useAddress()
  const { hasUnread } = useNotifications()
  const [modalVisible, setModalVisible] = useState(false)

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
        {/* Logo */}
        <View>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Slogan + Endereço */}
        <View style={styles.centerColumn}>
          <Text style={styles.sloganText}>Aqui, você compra com economia!</Text>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={styles.addressButton}
            hitSlop={8}
          >
            <Icon icon="MapPin" size={16} color={colors.background} />
            <Text style={styles.addressText} numberOfLines={1}>
              {displayAddress}
            </Text>
            <Icon icon="ChevronDown" size={14} color={colors.textInverse} />
          </Pressable>
        </View>

        {/* Notificações */}
        <Pressable
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
          hitSlop={10}
        >
          <Icon
            icon={hasUnread ? 'BellDot' : 'Bell'}
            size={20}
            color={colors.primary}
          />
          {hasUnread && <View style={styles.notificationDot} />}
        </Pressable>
      </View>

      <AddressSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  )
}
