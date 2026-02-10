// src/components/home/NearbySellerCard.tsx

import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'
import { homeStyles as styles } from '@/styles/home.styles'
import { NearbySeller } from '@/types'
import { userTagsLabels } from '@/utils/enumLabels/userTags.labels'
import { capitalizeFullName } from '@/utils/capitalizeFullName'

const DEFAULT_AVATAR = 'https://static.compranomia.com/defaults/seller.png'

interface Props {
  seller: NearbySeller
  onPress?: () => void
}

export function NearbySellerCard({ seller, onPress }: Props) {
  const avatarUri = seller.profilePhoto || DEFAULT_AVATAR
  const translatedTags =
    seller.tags?.map((tag) => userTagsLabels[tag]).filter((label) => !!label) ||
    []

  return (
    <TouchableOpacity
      style={styles.nearbyCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: avatarUri }}
        style={styles.nearbyCardAvatar}
        resizeMode="cover"
      />

      <View style={styles.nearbyCardContent}>
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
        {translatedTags.length > 0 && (
          <View style={styles.nearbyCardTags}>
            {translatedTags.slice(0, 3).map((label) => (
              <View key={label} style={styles.nearbyCardTag}>
                <Text style={styles.nearbyCardTagText}>{label}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.nearbyCardInfoRow}>
          <View style={styles.nearbyCardInfo}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.nearbyCardInfoText}>
              {seller.distanceKm} km
            </Text>
          </View>

          <View style={styles.nearbyCardInfo}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.nearbyCardInfoText}>
              {seller.averageDeliveryTime} min
            </Text>
          </View>

          {seller.deliveryFee === 0 ? (
            <Text style={styles.nearbyCardFreeTag}>Grátis</Text>
          ) : (
            <View style={styles.nearbyCardInfo}>
              <Ionicons
                name="bicycle-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.nearbyCardInfoText}>
                R$ {seller.deliveryFee.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
        style={styles.nearbyCardArrow}
      />
    </TouchableOpacity>
  )
}
