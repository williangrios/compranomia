// src/components/home/PromotionCard.tsx

import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { homeStyles as styles } from '@/styles/home.styles'
import { SellerProductResult } from '@/types'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { Ionicons } from '@expo/vector-icons'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { formatters } from '@/utils/formatters'
import { DiscountBadge } from '../ui/DiscountBadge'

interface Props {
  product: SellerProductResult
  onPress?: () => void
}

export function PromotionCard({ product, onPress }: Props) {
  const images = product.processedImages?.length
    ? product.processedImages
    : product.originalImages

  const imageUri = images?.[0] ?? DEFAULT_IMAGE
  const displayPrice = product.promotionalPrice ?? product.price
  const SCREEN_WIDTH = Dimensions.get('window').width
  const HORIZONTAL_PADDING = 2 // igual ao FlatList paddingHorizontal
  const PROMO_SLIDER_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING) / 2.4

  return (
    <TouchableOpacity
      style={[styles.promoCard, { width: PROMO_SLIDER_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.promoCardImageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.promoCardImage}
          resizeMode="cover"
        />
        {product.discountPercent > 0 && (
          <DiscountBadge percent={product.discountPercent} />
        )}
      </View>

      <View style={styles.promoCardBody}>
        <View style={styles.promoCardSellerRow}>
          <Ionicons
            name="storefront-outline"
            size={16}
            color={styles.promoCardSeller.color}
          />
          <Text style={styles.promoCardName} numberOfLines={2}>
            {capitalizeFullName(product.seller?.nickName)}
          </Text>
        </View>
        <Text style={styles.promoCardBody} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.promoCardPriceRow}>
          <Text style={styles.promoCardPrice}>
            {formatters.showPrice(
              displayPrice,
              product.step,
              product.measurementUnit,
            )}
          </Text>
        </View>
        {product.promotionalPrice != null && (
          <Text style={styles.promoCardPriceOriginal}>
            {formatters.showOriginalPrice(product.price)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
