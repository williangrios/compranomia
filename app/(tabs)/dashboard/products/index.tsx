import { useEffect, useState } from 'react'
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
import { Icon } from '@/components/ui/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { colors } from '@/theme'
import { productStyles as styles } from '@/styles/product.styles'
import { SellerProduct } from '@/types/sellerProduct'
import { sellerProductService } from '@/services/sellerProduct.service'
import { SellerProductCard } from '@/components/product/SellerProductCard'
import { getApiErrors } from '@/utils/getApiErrors'

interface ApiError {
  message: string
  field?: string
}

export default function Products() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [products, setProducts] = useState<SellerProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setIsLoading(true)
      setApiErrors(null)
      const response = await sellerProductService.list()
      setProducts(
        Array.isArray(response?.data?.sellerProducts)
          ? response.data.sellerProducts
          : [],
      )
    } catch (error: unknown) {
      setProducts([])
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  function handleDelete(product: SellerProduct) {
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${product.name || product.productCatalog?.name || 'este produto'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setApiErrors(null)
              await sellerProductService.delete(product.id)
              loadProducts()
            } catch (error: unknown) {
              setApiErrors(getApiErrors(error))
            }
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
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
              loadProducts()
            }}
          />
        }
      >
        <ErrorMessage errors={apiErrors} />

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon icon="Package" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
          </View>
        ) : (
          products.map((product) => (
            <SellerProductCard
              key={product.id}
              product={product}
              onEdit={() =>
                router.push(`/dashboard/products/edit/${product.id}`)
              }
              onDelete={() => handleDelete(product)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/dashboard/products/add')}
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
        <Icon icon="Plus" size={28} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  )
}
