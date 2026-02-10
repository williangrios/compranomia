import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'
import { productStyles as styles } from '@/styles/product.styles'
import { SellerProduct } from '@/types/sellerProduct'
import { DEFAULT_IMAGE } from '@/utils/constants'

interface Props {
  product: SellerProduct
  onEdit: () => void
  onDelete: () => void
}

export function SellerProductCard({ product, onEdit, onDelete }: Props) {
  const catalog = product.productCatalog
  const name = product.name || catalog?.name || ''
  const images = product.processedImages?.length
    ? product.processedImages
    : product.originalImages?.length
      ? product.originalImages
      : catalog?.processedImages?.length
        ? catalog.processedImages
        : catalog?.originalImages
  const imageUri = images?.[0] ?? DEFAULT_IMAGE

  const hasPromo =
    product.promotionalPrice != null && product.promotionalPrice < product.price

  const isLowStock =
    product.minStockAlert != null && product.stock <= product.minStockAlert

  return (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.85}
      style={styles.sellerCard}
    >
      <Image source={{ uri: imageUri }} style={styles.sellerCardImage} />

      <View style={styles.sellerCardContent}>
        <Text style={styles.sellerCardName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.sellerCardCategory}>{product.productCategory}</Text>
        <View style={styles.sellerCardRow}>
          {hasPromo ? (
            <>
              <Text style={styles.sellerCardPrice}>
                R$ {product.promotionalPrice!.toFixed(2)}
              </Text>
              <Text style={styles.sellerCardPriceOriginal}>
                R$ {product.price.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.sellerCardPrice}>
              R$ {product.price.toFixed(2)}
            </Text>
          )}
        </View>

        {product.isActive ? (
          <View
            style={[styles.sellerCardBadge, { backgroundColor: '#DCFCE7' }]}
          >
            <Text
              style={[styles.sellerCardBadgeText, { color: colors.success }]}
            >
              Produto à venda
            </Text>
          </View>
        ) : (
          <View
            style={[styles.sellerCardBadge, { backgroundColor: '#FEE2E2' }]}
          >
            <Text style={[styles.sellerCardBadgeText, { color: colors.error }]}>
              Oculto dos clientes
            </Text>
          </View>
        )}

        {hasPromo && product.isActive && (
          <View
            style={[styles.sellerCardBadge, { backgroundColor: '#DCFCE7' }]}
          >
            <Text
              style={[styles.sellerCardBadgeText, { color: colors.success }]}
            >
              Em promoção
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sellerCardActions}>
        <TouchableOpacity
          style={styles.sellerCardActionButton}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sellerCardActionButton}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}
