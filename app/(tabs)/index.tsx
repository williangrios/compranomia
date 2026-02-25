// app/(tabs)/index.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { PromotionCard } from '@/components/home/PromotionCard'
import { NearbySellerCard } from '@/components/home/NearbySellerCard'
import { useAddress } from '@/contexts/AddressContext'
import { sellerService } from '@/services/seller.service'
import { NearbySeller, SellerProductResult } from '@/types'
import { homeStyles as styles } from '@/styles/home.styles'
import { colors } from '@/theme'
import { toastService } from '@/services/toast.service'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { CategoryCards } from '@/components/home/CategoryIcon'
import { Icon } from '@/components/ui/Icon'

export default function Home() {
  const router = useRouter()
  const { address, coordinates } = useAddress()

  const [sellers, setSellers] = useState<NearbySeller[]>([])
  const [promotions, setPromotions] = useState<SellerProductResult[]>([])
  const [sponsored, setSponsored] = useState<SellerProductResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [promotionsTotal, setPromotionsTotal] = useState(0)
  const [sponsoredTotal, setSponsoredTotal] = useState(0)
  const [sellersTotal, setSellersTotal] = useState(0)
  const [isLoadingMorePromotions, setIsLoadingMorePromotions] = useState(false)
  const [isLoadingMoreSponsored, setIsLoadingMoreSponsored] = useState(false)
  const [isLoadingMoreSellers, setIsLoadingMoreSellers] = useState(false)

  const loadData = useCallback(async () => {
    if (!coordinates) return

    try {
      const feed = await sellerService.getHomeFeed(
        coordinates.lat,
        coordinates.lng,
      )

      setSellers(feed.sellers)
      setPromotions(feed.promotions)
      setSponsored(feed.sponsored)
      setPromotionsTotal(feed.promotionsTotal)
      setSponsoredTotal(feed.sponsoredTotal)
      setSellersTotal(feed.sellersTotal)
    } catch (error) {
      console.error('Error loading home data:', error)
    }
  }, [coordinates])

  useEffect(() => {
    if (!coordinates) return

    setIsLoading(true)
    loadData().finally(() => setIsLoading(false))
  }, [coordinates, loadData])

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
        { skip: sponsored.length },
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
        { skip: promotions.length },
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
        { skip: sellers.length },
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

  // Sem endereço selecionado
  if (!address) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.noAddressContainer}>
          <Icon icon="MapPin" size={64} color={colors.primary} />
          <Text style={styles.noAddressTitle}>Selecione um endereço</Text>
          <Text style={styles.noAddressSubtitle}>
            Para ver lojas e produtos perto de você, selecione um endereço de
            entrega no topo da tela.
          </Text>
        </View>
      </View>
    )
  }

  // Sem coordenadas no endereço
  if (!coordinates) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.noAddressContainer}>
          <Icon icon="TriangleAlert" size={64} color={colors.primary} />
          <Text style={styles.noAddressTitle}>Endereço sem localização</Text>
          <Text style={styles.noAddressSubtitle}>
            O endereço selecionado não possui coordenadas. Edite o endereço ou
            selecione outro.
          </Text>
        </View>
      </View>
    )
  }

  // Loading inicial
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header />
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
        <CategoryCards
          onSelect={(category) => router.push(`/category/${category}`)}
        />

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

        {/* ═══ Lojas Próximas ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lojas Próximas</Text>
          </View>

          {sellers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon icon="Store" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                Nenhuma loja encontrada na sua região
              </Text>
            </View>
          ) : (
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
                    Nenhuma loja encontrada na sua região
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
          )}
        </View>
      </ScrollView>
    </View>
  )
}
