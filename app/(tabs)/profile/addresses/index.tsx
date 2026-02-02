// app/(tabs)/profile/addresses/index.tsx
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AddressCard } from '@/components/profile/AddressCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { DeliveryAddress } from '@/types'
import { colors } from '@/theme'

interface ApiError {
  message: string
  field?: string
}

export default function Addresses() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  async function loadAddresses() {
    try {
      setIsLoading(true)
      setApiErrors(null)
      const response = await deliveryAddressService.list()

      const addressList = response?.deliveryAddresses || []

      setAddresses(Array.isArray(addressList) ? addressList : [])
    } catch (error: unknown) {
      console.error('Error loading addresses:', error)
      setAddresses([])
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
      } else {
        setApiErrors([{ message: 'GenericError' }])
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
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
              } // ← CORRIGIDO: era template tag
              onDelete={() => {}}
              onSetDefault={() => {}}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/profile/addresses/add')}
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
