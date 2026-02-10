import { useState } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'
import { productStyles as styles } from '@/styles/product.styles'
import { SellerProduct } from '@/types/sellerProduct'
import { UserTags, MeasurementUnit } from '@wrcb/cb-common'
import { DEFAULT_IMAGE } from '@/utils/constants'

interface Props {
  product: SellerProduct
  onAddToCart?: (quantity: number) => void
}

const MEDICINE_IMAGE = require('../../../assets/medicine.png')

const MEDICINE_TAGS: string[] = [UserTags.Medicines, UserTags.GenericMedicines]

const UNIT_TYPES: string[] = [
  MeasurementUnit.Un,
  MeasurementUnit.Pack,
  MeasurementUnit.Bandeja,
  MeasurementUnit.Pct,
]

export function ConsumerProductCard({ product, onAddToCart }: Props) {
  const catalog = product.productCatalog
  const name = product.name || catalog?.name || 'Produto'
  const brand = product.brand || catalog?.brand
  const category = product.productCategory || catalog?.productCategory || ''
  const unit = product.measurementUnit || catalog?.measurementUnit || 'Un'
  const step = product.step ?? 1

  const isMedicine = MEDICINE_TAGS.includes(category)
  const isUnitBased = UNIT_TYPES.includes(unit)
  const increment = isUnitBased ? 1 : step

  const images = product.processedImages?.length
    ? product.processedImages
    : product.originalImages?.length
      ? product.originalImages
      : catalog?.processedImages?.length
        ? catalog.processedImages
        : catalog?.originalImages
  const imageSource = isMedicine
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

  function handleIncrement() {
    const next = quantity + increment
    // if (next > product.stock) return
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

  function formatQuantity(): string {
    if (isUnitBased) return String(quantity)
    if (unit === MeasurementUnit.Kg || unit === MeasurementUnit.L) {
      return quantity >= 1000
        ? `${(quantity / 1000).toFixed(1)}${unit}`
        : `${quantity}${unit === MeasurementUnit.Kg ? 'g' : 'mL'}`
    }
    return `${quantity}${unit}`
  }

  function formatStep(): string {
    if (isUnitBased) return ''
    if (unit === MeasurementUnit.g || unit === MeasurementUnit.mL) {
      return `Vendido de ${step}${unit} em ${step}${unit}`
    }
    if (unit === MeasurementUnit.Kg) {
      return step < 1
        ? `Vendido de ${step * 1000}g em ${step * 1000}g`
        : `Vendido de ${step}Kg em ${step}Kg`
    }
    if (unit === MeasurementUnit.L) {
      return step < 1
        ? `Vendido de ${step * 1000}mL em ${step * 1000}mL`
        : `Vendido de ${step}L em ${step}L`
    }
    return `Vendido de ${step}${unit} em ${step}${unit}`
  }

  function formatPricePerUnit(): string {
    if (isUnitBased) return `R$ ${displayPrice.toFixed(2)} / ${unit}`
    return `R$ ${displayPrice.toFixed(2)} / ${unit}`
  }

  return (
    <View style={styles.consumerCard}>
      {/* Imagem */}
      <View style={styles.consumerCardImageContainer}>
        <Image
          source={imageSource}
          style={styles.consumerCardImage}
          resizeMode="cover"
        />
        {hasPromo && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <Text style={styles.consumerCardDiscount}>-{discountPercent}%</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.consumerCardBody}>
        <Text style={styles.consumerCardName} numberOfLines={2}>
          {name}
        </Text>

        {brand && <Text style={styles.consumerCardBrand}>{brand}</Text>}

        {/* Preço */}
        <View style={styles.consumerCardPriceRow}>
          <Text style={styles.consumerCardPrice}>
            R$ {displayPrice.toFixed(2)}
          </Text>
          {hasPromo && (
            <Text style={styles.consumerCardPriceOriginal}>
              R$ {product.price.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Unidade e step */}
        <Text style={styles.consumerCardUnit}>{formatPricePerUnit()}</Text>
        {!isUnitBased && (
          <Text style={styles.consumerCardUnit}>{formatStep()}</Text>
        )}

        {/* Footer: quantidade + adicionar */}
        <View style={styles.consumerCardFooter}>
          {/* Controle de quantidade */}
          <View style={styles.consumerCardQuantityRow}>
            <TouchableOpacity
              style={styles.consumerCardQuantityButton}
              onPress={handleDecrement}
              disabled={quantity <= 0}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color={colors.textInverse} />
            </TouchableOpacity>

            <Text style={styles.consumerCardQuantityText}>
              {formatQuantity()}
            </Text>

            <TouchableOpacity
              style={styles.consumerCardQuantityButton}
              onPress={handleIncrement}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* Botão adicionar */}
          <TouchableOpacity
            style={[
              styles.consumerCardAddButton,
              quantity <= 0 && { backgroundColor: colors.disabled },
            ]}
            onPress={handleAddToCart}
            disabled={quantity <= 0}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cart-outline"
              size={18}
              color={colors.textInverse}
            />
            <Text style={styles.consumerCardAddButtonText}>
              {quantity > 0
                ? `R$ ${(displayPrice * (isUnitBased ? quantity : quantity / step)).toFixed(2)}`
                : 'Adicionar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aviso de variação para granel */}
        {!isUnitBased && (
          <Text
            style={[
              styles.consumerCardUnit,
              { marginTop: 4, fontStyle: 'italic' },
            ]}
          >
            Peso pode variar ligeiramente para mais ou para menos
          </Text>
        )}
      </View>
    </View>
  )
}
