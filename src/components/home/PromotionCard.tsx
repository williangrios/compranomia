// src/components/home/PromotionCard.tsx

import { View, Text, Image, TouchableOpacity } from 'react-native'
import { homeStyles as styles } from '@/styles/home.styles'
import { SellerProductResult } from '@/types'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { Ionicons } from '@expo/vector-icons'
import { capitalizeFullName } from '@/utils/capitalizeFullName'

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

  return (
    <TouchableOpacity
      style={styles.promoCard}
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
          <View style={styles.promoCardBadge}>
            <Text style={styles.promoCardBadgeText}>
              -{product.discountPercent}%
            </Text>
          </View>
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

        <View style={styles.promoCardPriceRow}>
          <Text style={styles.promoCardPrice}>
            R$ {displayPrice.toFixed(2)}
          </Text>
          {product.promotionalPrice != null && (
            <Text style={styles.promoCardPriceOriginal}>
              R$ {product.price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
