import { useRouter, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout/Screen'
import { SellerProductForm } from '@/components/forms/SellerProductForm'

export default function AdoptProduct() {
  const router = useRouter()
  const { productCatalogId } = useLocalSearchParams<{
    productCatalogId: string
  }>()

  function handleSuccess() {
    router.replace('/dashboard/products/')
  }

  return (
    <Screen>
      <SellerProductForm
        productCatalogId={productCatalogId}
        onSuccess={handleSuccess}
      />
    </Screen>
  )
}
