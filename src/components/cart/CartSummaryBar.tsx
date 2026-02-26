import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Icon } from '@/components/ui/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { capitalizeFullName } from '@/utils/capitalizeFullName'

interface CartSummaryBarProps {
  sellerNickName: string
  cartCount: number
  cartSubtotal: number
  sellerId: string
}

export function CartSummaryBar({
  sellerNickName,
  cartCount,
  cartSubtotal,
  sellerId,
}: CartSummaryBarProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      {/* Label do seller */}
      <Text style={styles.sellerLabel}>
        Carrinho em: {capitalizeFullName(sellerNickName)}
      </Text>

      {/* Row principal */}
      <View style={styles.row}>
        {/* Botão ver carrinho */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/seller/${sellerId}/checkout`)}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>Ver carrinho</Text>
        </TouchableOpacity>

        {/* Ícone + quantidade */}
        <View style={styles.itemsRow}>
          <Icon icon="ShoppingCart" size={22} color="#FFF" />
          <Text style={styles.itemsText}>
            {cartCount} {cartCount === 1 ? 'item' : 'itens'}
          </Text>
        </View>

        {/* Total */}
        <Text style={styles.totalText}>R$ {cartSubtotal.toFixed(2)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sellerLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  checkoutButtonText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '700',
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  totalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
