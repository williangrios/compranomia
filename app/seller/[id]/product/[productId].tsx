// app/seller/[id]/product/[productId].tsx
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MeasurementUnit, UserTags } from '@wrcb/cb-common'
import { useCart } from '@/contexts/CartContext'
import { formatters } from '@/utils/formatters'
import { colors, spacing } from '@/theme'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { SellerProductResult } from '@/types'
import { CartSummaryBar } from '@/components/cart/CartSummaryBar'
import { DiscountBadge } from '@/components/ui/DiscountBadge'
import { sellerProductService } from '@/services/sellerProduct.service'

const SCREEN_WIDTH = Dimensions.get('window').width
const MEDICINE_IMAGE = require('../../../../assets/medicine.png')

export default function ProductDetail() {
  const { id, productId } = useLocalSearchParams<{
    id: string
    productId: string
  }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getCartCount, getCartSubtotal, addProductToCart } = useCart()
  const [product, setProduct] = useState<SellerProductResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await sellerProductService.getById(productId)
        setProduct(response.data.sellerProduct)
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={s.container}>
        <Text>Produto não encontrado</Text>
      </View>
    )
  }

  const seller = product.sellerId
  const cartCount = getCartCount(id!)
  const cartSubtotal = getCartSubtotal(id!)

  const name = product.name || 'Produto'
  const category = product.productCategory || ''
  const measurementUnit = product.measurementUnit || MeasurementUnit.Un
  const step = product.step ?? 1
  const isProhibitedForMinors = product.isProhibitedForMinors ?? false
  const isPrescriptionRequired = product.isPrescriptionRequired ?? false

  const isUnit = product.measurementUnit === MeasurementUnit.Un
  const increment = isUnit ? 1 : step

  const images = product.processedImages?.length
    ? product.processedImages
    : product.originalImages?.length
      ? product.originalImages
      : []

  const hasPromo =
    product.promotionalPrice != null && product.promotionalPrice < product.price
  const displayPrice = hasPromo ? product.promotionalPrice! : product.price
  const discountPercent = hasPromo
    ? Math.round(
        ((product.price - product.promotionalPrice!) / product.price) * 100,
      )
    : 0

  function handleIncrement() {
    setQuantity((prev) => prev + increment)
  }

  function handleDecrement() {
    setQuantity((prev) => {
      const next = prev - step
      return next < 0 ? 0 : next
    })
  }

  const imageSource = product.isPrescriptionRequired
    ? MEDICINE_IMAGE
    : { uri: images[activeImageIndex] || DEFAULT_IMAGE }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Icon icon="ArrowLeft" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          Item: {name}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 140 : 100 }}
      >
        {/* Imagem principal */}
        <View style={s.imageContainer}>
          <Image
            source={imageSource}
            style={s.mainImage}
            resizeMode="contain"
          />
          {hasPromo && <DiscountBadge percent={discountPercent} size="lg" />}
        </View>

        {/* Thumbnails */}
        {images.length > 1 && !product.isPrescriptionRequired && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbnailRow}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveImageIndex(idx)}
                style={[
                  s.thumbnail,
                  activeImageIndex === idx && s.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: img }}
                  style={s.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Info */}
        <View style={s.infoSection}>
          <Text style={s.productName}>{name}</Text>

          {product.brand && <Text style={s.brand}>{product.brand}</Text>}

          {/* Preço */}
          <View style={s.priceRow}>
            <Text style={s.price}>
              {formatters.showOriginalPrice(displayPrice)}
            </Text>
            {hasPromo && (
              <Text style={s.priceOriginal}>
                {formatters.showOriginalPrice(product.price)}
              </Text>
            )}
          </View>

          <Text style={s.stepText}>
            {formatters.formatStep(step, measurementUnit)}
          </Text>

          {/* Descrição */}
          {product.description ? (
            <View style={s.descriptionSection}>
              <Text style={s.sectionLabel}>Descrição</Text>
              <Text style={s.description}>{product.description}</Text>
            </View>
          ) : null}

          {/* Barcode */}
          {product.barcode && (
            <View style={s.descriptionSection}>
              <Text style={s.sectionLabel}>Código de barras</Text>
              <Text style={s.metaText}>
                <Icon icon="Barcode" size={16} color={colors.textSecondary} />
                {product.barcode}
              </Text>
            </View>
          )}

          {product.brand && (
            <View style={s.descriptionSection}>
              <Text style={s.sectionLabel}>Marca</Text>
              <Text style={s.metaText}>{product.brand}</Text>
            </View>
          )}

          {product.measurementUnit === MeasurementUnit.Un && (
            <View style={s.descriptionSection}>
              <Text style={s.sectionLabel}>Peso/Volume</Text>
              <Text style={s.metaText}>{product.baseWeight}</Text>
            </View>
          )}

          {(measurementUnit !== MeasurementUnit.Un ||
            isProhibitedForMinors ||
            isPrescriptionRequired) && (
            <View style={s.descriptionSection}>
              <Text style={s.sectionLabel}>Observações</Text>
              {measurementUnit !== MeasurementUnit.Un && (
                <Text style={s.bulkNote}>
                  O peso pode variar ligeiramente para mais ou para menos
                </Text>
              )}
              {isProhibitedForMinors && (
                <Text style={s.bulkNote}>
                  Produto vendido apenas para maiores de idade (o entregador irá
                  checar a identidade no mometo da entrega)
                </Text>
              )}
              {isPrescriptionRequired && (
                <Text style={s.bulkNote}>
                  Produto necessita de receita mética (verifique o chat pois o
                  farmacêutico irá solicitar o envio da receita)
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer fixo: quantidade + adicionar */}
      <View
        style={[
          s.footer,
          { paddingBottom: cartCount > 0 ? 8 : insets.bottom + 14 },
        ]}
      >
        <View style={s.quantityRow}>
          <TouchableOpacity
            style={[s.qtyButton, quantity <= 0 && s.qtyButtonDisabled]}
            onPress={handleDecrement}
            disabled={quantity <= 0}
            activeOpacity={0.8}
          >
            <Icon icon="Minus" size={20} color="#FFF" />
          </TouchableOpacity>

          <Text style={s.qtyText}>
            {formatters.formatQuantity(quantity, measurementUnit)}
          </Text>

          <TouchableOpacity
            style={s.qtyButton}
            onPress={handleIncrement}
            activeOpacity={0.8}
          >
            <Icon icon="Plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            s.addButton,
            quantity <= 0 && { backgroundColor: colors.disabled },
          ]}
          onPress={() => {
            addProductToCart(
              id!,
              {
                name: seller?.nickName ?? 'Vendedor',
                photo: seller?.profilePhoto ?? '',
              },
              product,
              quantity,
            )
            setQuantity(0) // ✅ Reseta a quantidade após adicionar
          }}
          disabled={quantity <= 0}
          activeOpacity={0.8}
        >
          <Icon icon="ShoppingCart" size={18} color="#FFF" />
          <Text style={s.addButtonText}>
            {formatters.calculatePrice(quantity, displayPrice, isUnit, step)}
          </Text>
        </TouchableOpacity>
      </View>
      <CartSummaryBar
        sellerNickName={seller?.nickName!}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        sellerId={seller?.id!}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  thumbnailRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: spacing.md,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  priceOriginal: {
    fontSize: 15,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  stepText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  descriptionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bulkNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
})
