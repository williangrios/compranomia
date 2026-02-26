// src/components/home/PromotionCard.tsx
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { homeStyles as styles } from '@/styles/home.styles'
import { SellerProductResult } from '@/types'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { Icon } from '@/components/ui/Icon'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { formatters } from '@/utils/formatters'
import { DiscountBadge } from '../ui/DiscountBadge'
import { colors, spacing } from '@/theme'

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
  const HORIZONTAL_PADDING = 2
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
          <Icon icon="Store" size={16} color={styles.promoCardSeller.color} />
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 6,
            marginTop: spacing.sm,
            gap: 4,
          }}
        >
          <Icon icon="Store" size={14} color={colors.textInverse} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.textInverse,
            }}
          >
            Ir para a loja
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
