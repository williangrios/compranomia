// app/(tabs)/profile/addresses/index.tsx
import { useState, useEffect } from 'react'
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
import { Header } from '@/components/ui/Header'
import { AddressCard } from '@/components/profile/AddressCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { DeliveryAddress } from '@/types'
import { colors } from '@/theme'
import { ProfileHeader } from '@/components/ui/ProfileHeader'

interface ApiError {
  message: string
  field?: string
}

export default function Addresses() {
  const router = useRouter()

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

      const { deliveryAddresses } = await deliveryAddressService.list()
      setAddresses(deliveryAddresses)
    } catch (error: unknown) {
      console.error('Error loading addresses:', error)
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

  async function handleSetDefault(id: string) {
    try {
      await deliveryAddressService.setDefault(id)
      await loadAddresses()
    } catch (error: unknown) {
      console.error('Error setting default:', error)
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await deliveryAddressService.delete(id)
      await loadAddresses()
    } catch (error: unknown) {
      console.error('Error deleting address:', error)
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
      }
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ProfileHeader title="Endereços" showBack />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProfileHeader title="Endereços" showBack />

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
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
              }
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        onPress={() => router.push('/profile/addresses/add')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  )
}
