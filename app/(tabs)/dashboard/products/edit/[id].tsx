// app/(tabs)/dashbord/products/edit/[id].tsx
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { SellerProductForm } from '@/components/forms/SellerProductForm'

export default function EditProduct() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  function handleSuccess() {
    router.replace('/dashboard/products/')
  }

  return (
    <Screen>
      <SellerProductForm sellerProductId={id} onSuccess={handleSuccess} />
    </Screen>
  )
}
