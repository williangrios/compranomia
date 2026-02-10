// app/(tabs)/index.tsx

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
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { PromotionCard } from '@/components/home/PromotionCard'
import { NearbySellerCard } from '@/components/home/NearbySellerCard'
import { useAddress } from '@/contexts/AddressContext'
import { sellerService } from '@/services/seller.service'
import { NearbySeller, SellerProductResult } from '@/types'
import { homeStyles as styles } from '@/styles/home.styles'
import { colors } from '@/theme'

export default function Home() {
  const router = useRouter()
  const { address, coordinates } = useAddress()

  const [sellers, setSellers] = useState<NearbySeller[]>([])
  const [promotions, setPromotions] = useState<SellerProductResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    if (!coordinates) return

    try {
      const [sellersRes, promosRes] = await Promise.all([
        sellerService.getNearby(coordinates.lat, coordinates.lng),
        sellerService.getPromotions(coordinates.lat, coordinates.lng, {
          limit: 20,
        }),
      ])

      setSellers(sellersRes.sellers)
      setPromotions(promosRes.products)
    } catch (error) {
      console.error('Error loading home data:', error)
    }
  }, [coordinates])

  useEffect(() => {
    if (!coordinates) return

    setIsLoading(true)
    loadData().finally(() => setIsLoading(false))
  }, [coordinates, loadData])

  async function handleRefresh() {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }

  function handleSellerPress(seller: NearbySeller) {
    router.push(`/seller/${seller.id}?distanceKm=${seller.distanceKm}`)
  }

  function handleProductPress(product: SellerProductResult) {
    if (product.seller) {
      router.push(`/seller/${product.seller.id}`)
    }
  }

  // Sem endereço selecionado
  if (!address) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.noAddressContainer}>
          <Ionicons name="location-outline" size={64} color={colors.primary} />
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
          <Ionicons name="warning-outline" size={64} color={colors.primary} />
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
              <Ionicons
                name="storefront-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                Nenhuma loja encontrada na sua região
              </Text>
            </View>
          ) : (
            sellers.map((seller) => (
              <NearbySellerCard
                key={seller.id}
                seller={seller}
                onPress={() => handleSellerPress(seller)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
