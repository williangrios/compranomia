// app/(tabs)/profile/addresses/add.tsx
import { useRouter } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { AddressForm } from '@/components/forms/AddressForm'
import { useAddress } from '@/contexts/AddressContext'

export default function AddAddress() {
  const router = useRouter()
  const { refreshAddressFromApi } = useAddress()

  async function handleSuccess() {
    await refreshAddressFromApi()
  }

  return (
    <Screen>
      <AddressForm onSuccess={handleSuccess} />
    </Screen>
  )
}
