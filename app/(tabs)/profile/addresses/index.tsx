import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { AddressCard } from '@/components/profile/AddressCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { DeliveryAddress } from '@/types'
import { colors } from '@/theme'
import { getApiErrors } from '@/utils/getApiErrors'

interface ApiError {
  message: string
  field?: string
}

const MAX_ADDRESSES = 4

export default function Addresses() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)

  async function loadAddresses() {
    try {
      setIsLoading(true)
      setApiErrors(null)
      const response = await deliveryAddressService.list()
      const addressList = response?.deliveryAddresses || []
      setAddresses(Array.isArray(addressList) ? addressList : [])
    } catch (error: unknown) {
      setAddresses([])
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 🔥 Recarrega SEMPRE que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadAddresses()
    }, []),
  )

  async function handleDelete(id: string) {
    try {
      setApiErrors(null)
      setSuccess(null)
      await deliveryAddressService.delete(id)
      setSuccess({ message: 'Endereço excluído com sucesso' })
      await loadAddresses()
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    }
  }

  async function handleSetDefault(id: string) {
    try {
      setApiErrors(null)
      setSuccess(null)
      await deliveryAddressService.setDefault(id)
      setSuccess({ message: 'Endereço padrão definido' })
      await loadAddresses()
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    }
  }

  function handleAddAddress() {
    if (addresses.length >= MAX_ADDRESSES) {
      Alert.alert(
        'Limite de endereços',
        `Você pode cadastrar no máximo ${MAX_ADDRESSES} endereços.`,
        [{ text: 'OK' }],
      )
      return
    }

    router.push('/profile/addresses/add')
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true)
              loadAddresses()
            }}
          />
        }
      >
        <SuccessMessage success={success} />
        <ErrorMessage errors={apiErrors} />

        {addresses.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons
              name="location-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Nenhum endereço cadastrado
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() =>
                router.push(`/profile/addresses/edit/${address.id}`)
              }
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={handleAddAddress}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          right: 20,
          bottom: insets.bottom + 80,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  )
}
