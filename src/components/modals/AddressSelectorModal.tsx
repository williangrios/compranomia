// components/modals/AddressSelectorModal.tsx
import { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { useAddress } from '@/contexts/AddressContext'
import { DeliveryAddress } from '@/types'

interface AddressSelectorModalProps {
  visible: boolean
  onClose: () => void
}

export function AddressSelectorModal({
  visible,
  onClose,
}: AddressSelectorModalProps) {
  const { address: currentAddress, setAddress } = useAddress()
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      loadAddresses()
    }
  }, [visible])

  async function loadAddresses() {
    try {
      setIsLoading(true)
      const response = await deliveryAddressService.list()
      setAddresses(response.deliveryAddresses || [])
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelectAddress(address: DeliveryAddress) {
    try {
      await setAddress(address)
      onClose()
    } catch (error) {
      console.error('Error setting address:', error)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary,
              }}
            >
              Selecionar endereço de entrega
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : addresses.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons
                name="location-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                Nenhum endereço cadastrado
              </Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              {addresses.map((addr) => {
                const isSelected = currentAddress?.id === addr.id
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: isSelected
                        ? colors.primary + '10'
                        : 'transparent',
                    }}
                    onPress={() => handleSelectAddress(addr)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <Ionicons
                            name="location"
                            size={16}
                            color={colors.primary}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '600',
                              color: colors.textPrimary,
                              marginLeft: 6,
                            }}
                          >
                            {addr.label}
                          </Text>
                          {addr.isDefault && (
                            <View
                              style={{
                                marginLeft: 8,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                backgroundColor: colors.primary + '20',
                                borderRadius: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '600',
                                  color: colors.primary,
                                }}
                              >
                                PADRÃO
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 13,
                            color: colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {addr.street}, {addr.number}
                          {addr.complement && ` - ${addr.complement}`}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                          }}
                        >
                          {addr.neighborhood} - {addr.city}/{addr.state}
                        </Text>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.primary}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
