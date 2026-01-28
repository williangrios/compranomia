// app/(tabs)/orders.tsx
import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@wrcb/cb-common'
import { colors } from '@/theme'

export default function Orders() {
  const { user } = useAuth()
  const isSeller = user?.role === UserRole.Seller

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Empty State */}
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.textPrimary,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            {isSeller ? 'Nenhum pedido recebido' : 'Nenhum pedido realizado'}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              paddingHorizontal: 40,
            }}
          >
            {isSeller
              ? 'Quando você receber pedidos, eles aparecerão aqui'
              : 'Quando você fizer pedidos, eles aparecerão aqui'}
          </Text>
        </View>

        {/* TODO: Adicionar lista de pedidos */}
      </ScrollView>
    </View>
  )
}
