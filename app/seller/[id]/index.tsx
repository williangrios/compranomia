// app/seller/[id]/index.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ConsumerProductCard } from '@/components/product/ConsumerProductCard'
import { userTagsLabels, sortByLabel } from '@/utils/enumLabels/userTags.labels'
import { sellerService } from '@/services/seller.service'
import { getTodaySchedule, formatSchedule } from '@/utils/schedule'
import { SellerProductResult } from '@/types'
import { sellerStoreStyles as styles } from '@/styles/sellerStore.styles'
import { colors, spacing } from '@/theme'
import { PaymentMethod, UserTags } from '@wrcb/cb-common'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { CartItem, useCart } from '@/contexts/CartContext'

const DEFAULT_AVATAR = 'https://static.compranomia.com/defaults/seller.png'

const nudgeStyles = StyleSheet.create({
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
})

interface SellerProfile {
  seller: {
    id: string
    nickName: string
    name: string
    bio: string
    profilePhoto: string
    category: string
    address: { neighborhood: string; city: string; state: string }
  }
  delivery: {
    ranges: {
      minKm: number
      maxKm: number
      fee: number
      freeAbove: number
      averageDeliveryTime: number
    }[]
  }
  schedule: {
    preparationTime: number
    days: {
      dayOfWeek: number
      isOpen: boolean
      periods: { openTime: string; closeTime: string }[]
      cutoffTime?: string | null
    }[]
    exceptions: any[]
  }
  acceptedPaymentMethods: PaymentMethod[]
  isActive: boolean
}

export default function SellerStore() {
  const { addItem, getCartCount } = useCart()
  const { id, distanceKm: distanceKmParam } = useLocalSearchParams<{
    id: string
    distanceKm?: string
  }>()
  const distanceKm = distanceKmParam ? parseFloat(distanceKmParam) : null
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<SellerProductResult[]>([])
  const [total, setTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<UserTags[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const translatedCategories = sortByLabel(
    categories,
    userTagsLabels as Record<string, string>,
  )

  // Dados derivados do profile
  const seller = profile?.seller || null
  const cartCount = seller ? getCartCount(id!) : 0
  const todaySchedule = profile ? getTodaySchedule(profile.schedule.days) : null
  const isOpenToday = todaySchedule?.isOpen ?? false
  const scheduleText = formatSchedule(todaySchedule)

  const scrollRef = useRef<ScrollView>(null)
  const hasNudged = useRef(false)

  useEffect(() => {
    if (categories.length > 1 && !hasNudged.current) {
      hasNudged.current = true
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: 40, animated: true })
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: 0, animated: true })
        }, 300)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [categories])

  const deliveryRange =
    profile && distanceKm != null
      ? profile.delivery.ranges.find(
          (r) => distanceKm >= r.minKm && distanceKm <= r.maxKm,
        ) || null
      : profile?.delivery.ranges[0] || null

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [profileRes, productsRes] = await Promise.all([
        sellerService.getSellerProfile(id),
        sellerService.getProducts(id, { limit: 20, skip: 0 }),
      ])

      setProfile(profileRes)
      setProducts(productsRes.products)
      setTotal(productsRes.total)

      const uniqueCategories = [
        ...new Set(
          productsRes.products
            .map((p) => p.productCategory)
            .filter((cat): cat is UserTags =>
              Object.values(UserTags).includes(cat as UserTags),
            ),
        ),
      ]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading seller data:', error)
    }
  }, [id])

  useEffect(() => {
    setIsLoading(true)
    loadData().finally(() => setIsLoading(false))
  }, [loadData])

  async function handleRefresh() {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }

  async function handleCategoryPress(category: string | null) {
    setSelectedCategory(category)
    setIsLoading(true)
    try {
      const params: any = { limit: 20, skip: 0 }
      if (category) params.productCategory = category
      const response = await sellerService.getProducts(id!, params)
      setProducts(response.products)
      setTotal(response.total)
    } catch (error) {
      console.error('Error filtering products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLoadMore() {
    if (isLoadingMore || products.length >= total) return
    setIsLoadingMore(true)
    try {
      const params: any = { limit: 20, skip: products.length }
      if (selectedCategory) params.productCategory = selectedCategory
      const response = await sellerService.getProducts(id!, params)
      setProducts((prev) => [...prev, ...response.products])
      setTotal(response.total)
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function handleAddToCart(product: SellerProductResult, quantity: number) {
    if (!seller) return

    const images = product.processedImages?.length
      ? product.processedImages
      : product.originalImages?.length
        ? product.originalImages
        : []

    const cartItem: CartItem = {
      sellerProductId: product.id,
      productCatalogId: product.productCatalogId,
      name: product.name,
      price: product.price,
      promotionalPrice: product.promotionalPrice,
      quantity,
      measurementUnit: product.measurementUnit,
      step: product.step ?? 1,
      image: images[0] || '',
      stock: product.stock,
    }

    addItem(
      id!,
      { name: seller.nickName, photo: seller.profilePhoto },
      cartItem,
    )
  }
  const promotionalProducts = products.filter((p) => p.discountPercent > 0)
  const regularProducts = products.filter((p) => p.discountPercent === 0)

  if (isLoading && !seller) {
    return (
      <View style={styles.container}>
        <View style={[styles.backButton, { top: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header expandido */}
      <View
        style={[styles.headerExpanded, { paddingTop: insets.top + spacing.sm }]}
      >
        {/* Top row: back + avatar + info */}
        <View style={styles.headerTopRow}>
          {/* Voltar */}
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Avatar + infos */}
          {seller && (
            <>
              <Image
                source={{ uri: seller.profilePhoto || DEFAULT_AVATAR }}
                style={styles.headerAvatarLarge}
                resizeMode="cover"
              />

              <View style={styles.headerMainInfo}>
                <View style={styles.promoCardSellerRow}>
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color={styles.promoCardSeller.color}
                  />

                  <Text style={styles.promoCardName} numberOfLines={2}>
                    {capitalizeFullName(seller.nickName)}
                  </Text>
                </View>

                {seller.bio ? (
                  <Text style={styles.headerBio} numberOfLines={1}>
                    {seller.bio.length > 50
                      ? seller.bio.substring(0, 50) + '...'
                      : seller.bio}
                  </Text>
                ) : null}

                <View style={styles.headerStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={14}
                      color="#FFD166"
                    />
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Carrinho fake */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              marginLeft: 'auto',
              position: 'relative',
              padding: 6,
            }}
            onPress={() => {
              if (cartCount > 0) {
                router.push(`/seller/${id}/checkout`)
              }
            }}
          >
            <Ionicons name="cart-outline" size={24} color="#FFF" />
            <View
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: colors.primary,
                }}
              >
                {cartCount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Badges de info */}
        <View style={styles.headerInfoBadges}>
          {/* Aberto/Fechado + Horário */}
          <View
            style={[
              styles.headerBadge,
              isOpenToday ? styles.headerBadgeOpen : styles.headerBadgeClosed,
            ]}
          >
            <Ionicons
              name={isOpenToday ? 'time-outline' : 'close-circle-outline'}
              size={14}
              color={isOpenToday ? colors.success : colors.error}
            />
            <Text
              style={
                isOpenToday
                  ? styles.headerBadgeOpenText
                  : styles.headerBadgeClosedText
              }
            >
              {scheduleText}
            </Text>
          </View>

          {/* Tempo de preparo */}
          {/* {profile && (
            <View style={styles.headerBadge}>
              <Ionicons
                name="restaurant-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.headerBadgeText}>
                Preparo: {profile.schedule.preparationTime} min
              </Text>
            </View>
          )} */}

          {/* Entrega */}
          {deliveryRange && (
            <View style={styles.headerBadge}>
              <Ionicons
                name="bicycle-outline"
                size={14}
                color={colors.textSecondary}
              />
              {deliveryRange.fee === 0 ? (
                <Text style={styles.headerFreeTag}>Entrega grátis</Text>
              ) : (
                <Text style={styles.headerBadgeText}>
                  Entrega: R$ {deliveryRange.fee.toFixed(2)}
                </Text>
              )}
            </View>
          )}

          {/* Tempo de entrega */}
          {deliveryRange && (
            <View style={styles.headerBadge}>
              <Ionicons
                name="car-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.headerBadgeText}>
                {deliveryRange.averageDeliveryTime} min
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filtro de categorias */}
      {categories.length > 1 && (
        <View style={{ position: 'relative', maxHeight: 48 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={styles.categoryChip}
              onPress={() => console.log('Abrir busca')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="search-outline"
                size={14}
                color={colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.categoryChipText}>Pesquisar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {translatedCategories.map((cat) => {
              const label =
                (userTagsLabels as Record<string, string>)[cat] ?? cat
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {/* Produtos */}
      <FlatList
        data={
          selectedCategory
            ? products
            : [...promotionalProducts, ...regularProducts]
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        // ListHeaderComponent={
        //   <View>
        //     {!selectedCategory && promotionalProducts.length > 0 && (
        //       <View style={styles.promoHeader}>
        //         <Text style={styles.promoHeaderText}>
        //           🔥 {promotionalProducts.length} produto
        //           {promotionalProducts.length > 1 ? 's' : ''} em promoção
        //         </Text>
        //       </View>
        //     )}
        //   </View>
        // }
        renderItem={({ item }) => (
          <ConsumerProductCard
            product={item as any}
            onAddToCart={(qty) => handleAddToCart(item, qty)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cube-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {selectedCategory
                ? 'Nenhum produto nesta categoria'
                : 'Nenhum produto disponível'}
            </Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loadingMore}
            />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
    </View>
  )
}
