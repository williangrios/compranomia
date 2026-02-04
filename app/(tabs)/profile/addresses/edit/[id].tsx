// app/(tabs)/profile/addresses/edit/[id].tsx
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { AddressForm } from '@/components/forms/AddressForm'
import { useAddress } from '@/contexts/AddressContext'

export default function EditAddress() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { refreshAddressFromApi } = useAddress()

  async function handleSuccess() {
    await refreshAddressFromApi()
  }

  return (
    <Screen>
      <AddressForm addressId={id} onSuccess={handleSuccess} />
    </Screen>
  )
}
