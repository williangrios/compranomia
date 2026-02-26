// src/components/home/SearchProductCard.tsx

import { View, Text, Image, TouchableOpacity } from 'react-native'
import { homeStyles as styles } from '@/styles/home.styles'
import { SellerProductResult } from '@/types'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { Icon } from '@/components/ui/Icon'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { formatters } from '@/utils/formatters'
import { DiscountBadge } from '../ui/DiscountBadge'

interface Props {
  product: SellerProductResult
  onPress?: () => void
}

export function SearchProductCard({ product, onPress }: Props) {
  const images = product.processedImages?.length
    ? product.processedImages
    : product.originalImages

  const imageUri = images?.[0] ?? DEFAULT_IMAGE
  const hasPromo =
    product.promotionalPrice != null && product.promotionalPrice < product.price
  const displayPrice = hasPromo ? product.promotionalPrice! : product.price

  return (
    <TouchableOpacity
      style={styles.searchCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.searchCardImage}
        resizeMode="cover"
      />

      <View style={styles.searchCardContent}>
        <Text style={styles.searchCardName} numberOfLines={2}>
          {product.name}
        </Text>

        {product.seller && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              icon="Store"
              size={14}
              color={styles.searchCardSeller.color}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.searchCardSeller} numberOfLines={1}>
              {capitalizeFullName(product.seller.nickName)}
            </Text>
          </View>
        )}

        <View style={styles.searchCardPriceRow}>
          <Text style={styles.searchCardPrice}>
            {formatters.showPrice(
              displayPrice,
              product.step,
              product.measurementUnit,
            )}
          </Text>
          {hasPromo && (
            <Text style={styles.searchCardPriceOriginal}>
              {formatters.showOriginalPrice(product.price)}
            </Text>
          )}
        </View>
        {product.discountPercent > 0 && (
          <DiscountBadge percent={product.discountPercent} />
        )}
      </View>
    </TouchableOpacity>
  )
}
