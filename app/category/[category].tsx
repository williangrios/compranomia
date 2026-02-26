// app/category/[category].tsx
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PromotionCard } from '@/components/home/PromotionCard'
import { NearbySellerCard } from '@/components/home/NearbySellerCard'
import { useAddress } from '@/contexts/AddressContext'
import { sellerService } from '@/services/seller.service'
import { NearbySeller, SellerProductResult } from '@/types'
import { homeStyles as styles } from '@/styles/home.styles'
import { colors, spacing } from '@/theme'
import { toastService } from '@/services/toast.service'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { UserCategory } from '@wrcb/cb-common'

const CATEGORY_LABELS: Record<string, string> = {
  Grocery: 'Mercado',
  Pharmacy: 'Farmácia',
  Butcher: 'Açougue',
  Greengrocer: 'Hortifruti',
  Food: 'Comida',
  PetShop: 'Pet Shop',
  ConvenienceStore: 'Conveniência',
  AgricultureStore: 'Agropecuária',
  Services: 'Serviços',
  WaterAndGasSupplier: 'Água e Gás',
}

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { coordinates } = useAddress()

  const [sellers, setSellers] = useState<NearbySeller[]>([])
  const [promotions, setPromotions] = useState<SellerProductResult[]>([])
  const [sponsored, setSponsored] = useState<SellerProductResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [promotionsTotal, setPromotionsTotal] = useState(0)
  const [sponsoredTotal, setSponsoredTotal] = useState(0)
  const [sellersTotal, setSellersTotal] = useState(0)
  const [isLoadingMorePromotions, setIsLoadingMorePromotions] = useState(false)
  const [isLoadingMoreSponsored, setIsLoadingMoreSponsored] = useState(false)
  const [isLoadingMoreSellers, setIsLoadingMoreSellers] = useState(false)

  const categoryLabel = CATEGORY_LABELS[category] ?? category

  const loadData = useCallback(async () => {
    if (!coordinates || !category) return

    try {
      const feed = await sellerService.getHomeFeed(
        coordinates.lat,
        coordinates.lng,
        { category },
      )

      setSellers(feed.sellers)
      setPromotions(feed.promotions)
      setSponsored(feed.sponsored)
      setSellersTotal(feed.sellersTotal)
      setPromotionsTotal(feed.promotionsTotal)
      setSponsoredTotal(feed.sponsoredTotal)
    } catch (error) {
      console.error('Error loading category feed:', error)
    }
  }, [coordinates, category])

  useEffect(() => {
    setIsLoading(true)
    loadData().finally(() => setIsLoading(false))
  }, [loadData])

  async function handleLoadMoreSponsored() {
    if (
      isLoadingMoreSponsored ||
      sponsored.length >= sponsoredTotal ||
      !coordinates
    )
      return
    setIsLoadingMoreSponsored(true)
    try {
      const res = await sellerService.getSponsored(
        coordinates.lat,
        coordinates.lng,
        { category, skip: sponsored.length },
      )
      setSponsored((prev) => [...prev, ...res.products])
      setSponsoredTotal(res.total)
    } catch (error) {
      console.error('Error loading more sponsored:', error)
    } finally {
      setIsLoadingMoreSponsored(false)
    }
  }

  async function handleLoadMorePromotions() {
    if (
      isLoadingMorePromotions ||
      promotions.length >= promotionsTotal ||
      !coordinates
    )
      return
    setIsLoadingMorePromotions(true)
    try {
      const res = await sellerService.getPromotions(
        coordinates.lat,
        coordinates.lng,
        { category, skip: promotions.length },
      )
      setPromotions((prev) => [...prev, ...res.products])
      setPromotionsTotal(res.total)
    } catch (error) {
      console.error('Error loading more promotions:', error)
    } finally {
      setIsLoadingMorePromotions(false)
    }
  }

  async function handleLoadMoreSellers() {
    if (isLoadingMoreSellers || sellers.length >= sellersTotal || !coordinates)
      return
    setIsLoadingMoreSellers(true)
    try {
      const res = await sellerService.getNearbySellers(
        coordinates.lat,
        coordinates.lng,
        { category, skip: sellers.length },
      )
      setSellers((prev) => [...prev, ...res.sellers])
      setSellersTotal(res.total)
    } catch (error) {
      console.error('Error loading more sellers:', error)
    } finally {
      setIsLoadingMoreSellers(false)
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }

  function handleSellerPress(seller: NearbySeller) {
    toastService.success({
      title: `🛍️ Você entrou na loja ${capitalizeFullName(seller.nickName)}`,
    })
    router.push(`/seller/${seller.id}?distanceKm=${seller.distanceKm}`)
  }

  function handleProductPress(product: SellerProductResult) {
    if (product.seller) {
      toastService.success({
        title: `🛍️ Você entrou na loja ${capitalizeFullName(product.seller.nickName)}`,
      })
      router.push(`/seller/${product.seller.id}`)
    }
  }

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          backgroundColor: colors.primary,
          gap: spacing.sm,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Icon icon="ArrowLeft" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#FFF',
            flex: 1,
          }}
        >
          {categoryLabel}
        </Text>
      </View>

      {/* Loading */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ═══ Patrocinados ═══ */}
          {sponsored.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Destaques</Text>
              </View>
              <FlatList
                data={sponsored}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                onEndReached={handleLoadMoreSponsored}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                  isLoadingMoreSponsored ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={{ paddingHorizontal: 16, alignSelf: 'center' }}
                    />
                  ) : null
                }
                renderItem={({ item }) => (
                  <PromotionCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                )}
              />
            </View>
          )}

          {/* ═══ Promoções ═══ */}
          {promotions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔥 Promoções</Text>
              </View>
              <FlatList
                data={promotions}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                onEndReached={handleLoadMorePromotions}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                  isLoadingMorePromotions ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={{ paddingHorizontal: 16, alignSelf: 'center' }}
                    />
                  ) : null
                }
                renderItem={({ item }) => (
                  <PromotionCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                )}
              />
            </View>
          )}

          {/* ═══ Lojas ═══ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Categoria: {categoryLabel}
              </Text>
            </View>
            <FlatList
              data={sellers}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              onEndReached={handleLoadMoreSellers}
              onEndReachedThreshold={0.3}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon icon="Store" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    Nenhuma loja encontrada nesta categoria para sua região
                  </Text>
                </View>
              }
              ListFooterComponent={
                isLoadingMoreSellers ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ paddingVertical: 16 }}
                  />
                ) : null
              }
              renderItem={({ item }) => (
                <NearbySellerCard
                  seller={item}
                  onPress={() => handleSellerPress(item)}
                />
              )}
            />
          </View>
        </ScrollView>
      )}
    </View>
  )
}
