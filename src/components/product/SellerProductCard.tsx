import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'
import { SellerProduct } from '@/types/sellerProduct'

interface Props {
  product: SellerProduct
  onEdit: () => void
  onToggleActive: () => void
}

export function SellerProductCard({ product, onEdit }: Props) {
  return (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.85}
      style={{
        backgroundColor: colors.primaryDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>
        {product.productCatalog?.name ?? 'Produto'}
      </Text>

      <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
        Estoque: {product.stock}
      </Text>

      <Text style={{ color: colors.textSecondary }}>
        Preço: R$ {product.price.toFixed(2)}
      </Text>

      {!product.isActive && (
        <Text style={{ color: colors.error, marginTop: 4 }}>
          Produto inativo
        </Text>
      )}
    </TouchableOpacity>
  )
}
