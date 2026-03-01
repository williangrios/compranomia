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
  TextInput,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
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
import { useCart } from '@/contexts/CartContext'
import { CartSummaryBar } from '@/components/cart/CartSummaryBar'
import { DEFAULT_AVATAR } from '@/utils/constants'

interface SellerProfile {
  seller: {
    id: string
    nickName: string
    name: string
    bio: string
    profilePhoto: string
    category: string
    averageRating: number
    ratingCount: number
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
  minimumOrderValue: number
  isActive: boolean
}

export default function SellerStore() {
  const { getCartCount, addProductToCart, getCartSubtotal } = useCart()
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
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, SellerProductResult[]>
  >({})
  const [viewMode, setViewMode] = useState<'all' | 'category' | 'search'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [spotlightedProducts, setSpotlightedProducts] = useState<
    SellerProductResult[]
  >([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const translatedCategories = sortByLabel(
    categories,
    userTagsLabels as Record<string, string>,
  )

  // Dados derivados do profile
  const seller = profile?.seller || null
  const cartCount = seller ? getCartCount(id!) : 0
  const cartSubtotal = seller ? getCartSubtotal(id!) : 0
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
      setSpotlightedProducts(
        productsRes.products.filter((p: any) => p.sellerSpotlighted === true),
      )
    } catch (error) {
      console.error('Error loading seller data:', error)
    }
  }, [id])

  useEffect(() => {
    setIsLoading(true)
    loadData().finally(() => setIsLoading(false))
  }, [loadData])

  useEffect(() => {
    // Carrega produtos por categoria quando as categorias forem definidas
    if (
      categories.length > 0 &&
      viewMode === 'all' &&
      Object.keys(categoryProducts).length === 0
    ) {
      const loadCategoryProducts = async () => {
        const categoryProductsMap: Record<string, SellerProductResult[]> = {}

        await Promise.all(
          categories.map(async (cat) => {
            const response = await sellerService.getProducts(id!, {
              productCategory: cat,
              limit: 10,
              skip: 0,
            })
            categoryProductsMap[cat] = response.products
          }),
        )

        setCategoryProducts(categoryProductsMap)
      }

      loadCategoryProducts()
    }
  }, [categories, viewMode, categoryProducts, id])

  async function handleRefresh() {
    setIsRefreshing(true)
    await loadData()

    // Recarregar conforme o modo atual
    if (viewMode === 'all') {
      await handleCategoryPress(null)
    } else if (viewMode === 'category' && selectedCategory) {
      await handleCategoryPress(selectedCategory)
    } else if (viewMode === 'search' && searchQuery.length >= 2) {
      await handleSearch(searchQuery)
    }

    setIsRefreshing(false)
  }

  async function handleCategoryPress(category: string | null) {
    setSelectedCategory(category)

    if (category === null) {
      // Modo "Todos" - carregar produtos por categoria para sliders
      setViewMode('all')
      setIsLoading(true)
      try {
        const categoryProductsMap: Record<string, SellerProductResult[]> = {}

        // Carregar produtos de cada categoria (10 por categoria)
        await Promise.all(
          categories.map(async (cat) => {
            const response = await sellerService.getProducts(id!, {
              productCategory: cat,
              limit: 10,
              skip: 0,
            })
            categoryProductsMap[cat] = response.products
          }),
        )

        setCategoryProducts(categoryProductsMap)
      } catch (error) {
        console.error('Error loading category products:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Modo Grid - categoria específica
      setViewMode('category')
      setIsLoading(true)
      try {
        const params: any = { limit: 20, skip: 0 }
        params.productCategory = category
        const response = await sellerService.getProducts(id!, params)
        setProducts(response.products)
        setTotal(response.total)
      } catch (error) {
        console.error('Error filtering products:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  async function handleSearch(text: string) {
    setSearchQuery(text)

    if (text.trim().length < 2) {
      setProducts([])
      setTotal(0)
      return
    }

    setIsLoading(true)
    try {
      const response = await sellerService.getProducts(id!, {
        q: text.trim(),
        limit: 20,
        skip: 0,
      })
      setProducts(response.products)
      setTotal(response.total)
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLoadMore() {
    // LoadMore só funciona nos modos category e search
    if (viewMode === 'all') return
    if (isLoadingMore || products.length >= total) return

    setIsLoadingMore(true)
    try {
      const params: any = { limit: 20, skip: products.length }

      if (viewMode === 'category' && selectedCategory) {
        params.productCategory = selectedCategory
      }

      if (viewMode === 'search' && searchQuery) {
        params.q = searchQuery
      }

      const response = await sellerService.getProducts(id!, params)
      setProducts((prev) => [...prev, ...response.products])
      setTotal(response.total)
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function redirectToItemPage(sellerId: string, itemId: string): void {
    router.push(`/seller/${sellerId}/product/${itemId}`)
  }

  if (isLoading && !seller) {
    return (
      <View style={styles.container}>
        <View style={[styles.backButton, { top: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Icon icon="ArrowLeft" size={24} color="#FFF" />
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
            <Icon icon="ArrowLeft" size={24} color="#FFF" />
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
                  <Icon
                    icon="Store"
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
                  {seller.ratingCount > 0 ? (
                    <>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          icon={
                            star <= Math.floor(seller.averageRating)
                              ? 'Star'
                              : star - seller.averageRating < 1
                                ? 'StarHalf'
                                : 'Star'
                          }
                          size={14}
                          color="#FFD166"
                          strokeWidth={0}
                          fill={
                            star <= Math.floor(seller.averageRating)
                              ? '#FFD166'
                              : star - seller.averageRating < 1
                                ? '#FFD166'
                                : 'none'
                          }
                        />
                      ))}
                      <Text style={styles.headerRatingText}>
                        {seller.averageRating.toFixed(1)} ({seller.ratingCount})
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.headerRatingText}>Sem avaliações</Text>
                  )}
                </View>
              </View>
            </>
          )}
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
            <Icon
              icon={isOpenToday ? 'Clock' : 'XCircle'}
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

          {/* Pedido mínimo */}
          {profile && profile.minimumOrderValue > 0 && (
            <View style={styles.headerBadge}>
              <Icon
                icon="ShoppingCart"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.headerBadgeText}>
                Mín.: R$ {profile.minimumOrderValue.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Tempo de entrega */}
          {deliveryRange && (
            <View style={styles.headerBadge}>
              <Icon icon="Car" size={14} color={colors.textSecondary} />
              <Text style={styles.headerBadgeText}>
                {deliveryRange.averageDeliveryTime} min
              </Text>
            </View>
          )}

          {/* Entrega */}
          {deliveryRange && (
            <View style={styles.headerBadge}>
              <Icon icon="Bike" size={14} color={colors.textSecondary} />
              {deliveryRange.fee === 0 ? (
                <Text style={styles.headerFreeTag}>Entrega grátis</Text>
              ) : (
                <Text style={styles.headerBadgeText}>
                  Entrega: R${deliveryRange.fee.toFixed(2)}
                </Text>
              )}
            </View>
          )}

          {deliveryRange && deliveryRange.freeAbove > 0 && (
            <View style={styles.headerBadge}>
              <Icon icon="Gift" size={14} color={colors.success} />
              <Text style={styles.headerFreeTag}>
                Entrega grátis acima R${deliveryRange.freeAbove.toFixed(2)}
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
              style={[
                styles.categoryChip,
                viewMode === 'search' && styles.categoryChipActive,
              ]}
              onPress={() => {
                setViewMode('search')
                setSelectedCategory(null)
                setSearchQuery('')
                setProducts([])
              }}
              activeOpacity={0.8}
            >
              <Icon
                icon="Search"
                size={14}
                color={
                  viewMode === 'search'
                    ? colors.textInverse
                    : colors.textSecondary
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  viewMode === 'search' && styles.categoryChipTextActive,
                ]}
              >
                Pesquisar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryChip,
                viewMode === 'all' && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  viewMode === 'all' && styles.categoryChipTextActive,
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
                    viewMode === 'category' &&
                      selectedCategory === cat &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      viewMode === 'category' &&
                        selectedCategory === cat &&
                        styles.categoryChipTextActive,
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
      {viewMode === 'search' && (
        <>
          {/* Input de busca */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Icon icon="Search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Buscar produtos nesta loja..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')} hitSlop={10}>
                  <Icon icon="XCircle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Resultados da busca */}
          <FlatList
            data={searchQuery.length >= 2 ? products : []}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: spacing.sm }}
            contentContainerStyle={[styles.productsGrid, { gap: spacing.sm }]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <ConsumerProductCard
                product={item as any}
                size="grid"
                onAddToCart={(qty) =>
                  addProductToCart(
                    id!,
                    {
                      name: seller?.nickName ?? 'Vendedor',
                      photo: seller?.profilePhoto ?? '',
                    },
                    item,
                    qty,
                  )
                }
                onPress={() => redirectToItemPage(id, item.id)}
              />
            )}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon icon="Search" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    {searchQuery.length < 2
                      ? 'Digite pelo menos 2 letras'
                      : 'Nenhum produto encontrado'}
                  </Text>
                </View>
              )
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
        </>
      )}

      {viewMode === 'category' && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={[styles.productsGrid, { gap: spacing.sm }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ConsumerProductCard
              product={item as any}
              size="grid"
              onAddToCart={(qty) =>
                addProductToCart(
                  id!,
                  {
                    name: seller?.nickName ?? 'Vendedor',
                    photo: seller?.profilePhoto ?? '',
                  },
                  item,
                  qty,
                )
              }
              onPress={() => redirectToItemPage(id, item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon icon="Package" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                Nenhum produto nesta categoria
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
      )}

      {viewMode === 'all' && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {spotlightedProducts.length > 0 && (
                <View style={styles.categorySection}>
                  <Text style={styles.categorySectionTitle}>⭐ Destaques</Text>
                  {/* retirado pois estava dando erro */}
                  {/* <FlatList
                    data={spotlightedProducts}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categorySliderContainer}
                    renderItem={({ item }) => (
                      <View style={{ marginRight: spacing.sm }}>
                        <ConsumerProductCard
                          product={item as any}
                          size="slider"
                          onAddToCart={(qty) =>
                            addProductToCart(
                              id!,
                              {
                                name: seller?.nickName ?? 'Vendedor',
                                photo: seller?.profilePhoto ?? '',
                              },
                              item,
                              qty,
                            )
                          }
                          onPress={() => redirectToItemPage(id, item.id)}
                        />
                      </View>
                    )}
                  /> */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categorySliderContainer}
                  >
                    {spotlightedProducts.map((item) => (
                      <View key={item.id} style={{ marginRight: spacing.sm }}>
                        <ConsumerProductCard
                          product={item as any}
                          size="slider"
                          onAddToCart={(qty) =>
                            addProductToCart(
                              id!,
                              {
                                name: seller?.nickName ?? 'Vendedor',
                                photo: seller?.profilePhoto ?? '',
                              },
                              item,
                              qty,
                            )
                          }
                          onPress={() => redirectToItemPage(id, item.id)}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {translatedCategories.map((cat) => {
                const categoryProductsList = categoryProducts[cat] || []
                if (categoryProductsList.length === 0) return null
                const label =
                  (userTagsLabels as Record<string, string>)[cat] ?? cat
                return (
                  <View key={cat} style={styles.categorySection}>
                    <Text style={styles.categorySectionTitle}>{label}</Text>
                    {/* retirado pois estava dando erro */}
                    {/* <FlatList
                      data={categoryProductsList}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categorySliderContainer}
                      renderItem={({ item }) => (
                        <View style={{ marginRight: spacing.sm }}>
                          <ConsumerProductCard
                            product={item as any}
                            size="slider"
                            onAddToCart={(qty) =>
                              addProductToCart(
                                id!,
                                {
                                  name: seller?.nickName ?? 'Vendedor',
                                  photo: seller?.profilePhoto ?? '',
                                },
                                item,
                                qty,
                              )
                            }
                            onPress={() => redirectToItemPage(id, item.id)}
                          />
                        </View>
                      )}
                    /> */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categorySliderContainer}
                    >
                      {categoryProductsList.map((item) => (
                        <View key={item.id} style={{ marginRight: spacing.sm }}>
                          <ConsumerProductCard
                            product={item as any}
                            size="slider"
                            onAddToCart={(qty) =>
                              addProductToCart(
                                id!,
                                {
                                  name: seller?.nickName ?? 'Vendedor',
                                  photo: seller?.profilePhoto ?? '',
                                },
                                item,
                                qty,
                              )
                            }
                            onPress={() => redirectToItemPage(id, item.id)}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )
              })}
            </>
          )}
        </ScrollView>
      )}

      <CartSummaryBar
        sellerNickName={seller?.nickName ?? ''}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        sellerId={seller?.id!}
      />
    </View>
  )
}
