import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/theme'
import { SellerProduct } from '@/types/sellerProduct'
import { MeasurementUnit } from '@wrcb/cb-common'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { formatters } from '@/utils/formatters'
import { DiscountBadge } from '../ui/DiscountBadge'

const SCREEN_WIDTH = Dimensions.get('window').width
const HORIZONTAL_PADDING = spacing.md * 2
const GAP = 10

// 'grid' = 2 por linha | 'slider' = 2.75 visíveis
const GRID_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP) / 2
const SLIDER_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING) / 2.75

interface Props {
  product: SellerProduct
  size: 'grid' | 'slider'
  onAddToCart?: (quantity: number) => void
  onPress: () => void
}

const MEDICINE_IMAGE = require('../../../assets/medicine.png')
const CARD_HEIGHT_SLIDER = 270

export function ConsumerProductCard({
  product,
  size = 'grid',
  onAddToCart,
  onPress,
}: Props) {
  const catalog = product.productCatalog
  const name = product.name || catalog?.name || 'Produto'
  const brand = product.brand || catalog?.brand
  const unit = product.measurementUnit || catalog?.measurementUnit || 'Un'
  const step = product.step ?? 1

  const isUnit = product.measurementUnit === MeasurementUnit.Un
  const increment = isUnit ? 1 : step

  const images = product.processedImages?.length
    ? product.processedImages
    : product.originalImages?.length
      ? product.originalImages
      : catalog?.processedImages?.length
        ? catalog.processedImages
        : catalog?.originalImages
  const imageSource = product.isPrescriptionRequired
    ? MEDICINE_IMAGE
    : { uri: images?.[0] ?? DEFAULT_IMAGE }

  const hasPromo =
    product.promotionalPrice != null && product.promotionalPrice < product.price
  const displayPrice = hasPromo ? product.promotionalPrice! : product.price
  const discountPercent = hasPromo
    ? Math.round(
        ((product.price - product.promotionalPrice!) / product.price) * 100,
      )
    : 0

  const [quantity, setQuantity] = useState(0)

  const cardWidth = size === 'slider' ? SLIDER_WIDTH : GRID_WIDTH
  const imageHeight = size === 'slider' ? 100 : 120
  const isCompact = size === 'slider'

  function handleIncrement() {
    const next = quantity + increment
    setQuantity(next)
  }

  function handleDecrement() {
    const next = quantity - increment
    if (next < 0) return
    setQuantity(next)
  }

  function handleAddToCart() {
    if (quantity <= 0 || !onAddToCart) return
    onAddToCart(quantity)
    setQuantity(0)
  }

  function formatQuantity(
    amount: number,
    measurementUnit: MeasurementUnit,
  ): string {
    return `${amount} ${measurementUnit}`
  }

  function formatStep(): string {
    if (isUnit) return ''
    if (unit === MeasurementUnit.g || unit === MeasurementUnit.mL) {
      return `De ${step}${unit} em ${step}${unit}`
    }
    if (unit === MeasurementUnit.Kg) {
      return step < 1
        ? `De ${step * 1000}g em ${step * 1000}g`
        : `De ${step}Kg em ${step}Kg`
    }
    if (unit === MeasurementUnit.L) {
      return step < 1
        ? `De ${step * 1000}mL em ${step * 1000}mL`
        : `De ${step}L em ${step}L`
    }
    return `De ${step}${unit} em ${step}${unit}`
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        s.card,
        {
          width: cardWidth,
          height: size === 'slider' ? CARD_HEIGHT_SLIDER : undefined,
        },
      ]}
    >
      {/* Imagem */}
      <View style={[s.imageContainer, { height: imageHeight }]}>
        <Image source={imageSource} style={s.image} resizeMode="cover" />
        {hasPromo && <DiscountBadge percent={discountPercent} />}
      </View>

      {/* Body */}

      <View style={s.body}>
        <View style={s.content}>
          <Text
            style={[s.name, isCompact && { fontSize: 12 }]}
            numberOfLines={2}
          >
            {name}
          </Text>

          {brand && !isCompact && (
            <Text style={s.brand} numberOfLines={1}>
              {brand}
            </Text>
          )}

          <View style={s.priceRow}>
            <Text style={[s.price, isCompact && { fontSize: 13 }]}>
              {formatters.showPrice(
                displayPrice,
                product.step,
                product.measurementUnit,
              )}
            </Text>
          </View>
          {hasPromo && (
            <Text style={s.priceOriginal}>
              {formatters.showOriginalPrice(product.price)}
            </Text>
          )}

          {!isUnit && !isCompact && (
            <Text style={s.stepText}>{formatStep()}</Text>
          )}
        </View>

        {/* Quantidade + Adicionar */}
        <View style={s.footer}>
          {/* Quantidade */}
          <View style={s.quantityRow}>
            <TouchableOpacity
              style={[s.qtyButton, quantity <= 0 && s.qtyButtonDisabled]}
              onPress={handleDecrement}
              disabled={quantity <= 0}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={18} color="#FFF" />
            </TouchableOpacity>

            <Text style={s.qtyText}>{formatQuantity(quantity, unit)}</Text>

            <TouchableOpacity
              style={s.qtyButton}
              onPress={handleIncrement}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Botão adicionar embaixo */}
          <TouchableOpacity
            style={[
              s.addButton,
              quantity <= 0 && { backgroundColor: colors.disabled },
            ]}
            onPress={handleAddToCart}
            disabled={quantity <= 0}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={14} color="#FFF" />
            <Text style={s.addButtonText}>
              {formatters.calculatePrice(quantity, displayPrice, isUnit, step)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  brand: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  priceOriginal: {
    fontSize: 11,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  stepText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footer: {
    marginTop: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 26,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bulkNote: {
    fontSize: 9,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
})
