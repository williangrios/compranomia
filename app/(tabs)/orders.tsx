// app/(tabs)/orders.tsx
import { View, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { colors } from '@/theme'
import { useAuth } from '@/contexts/AuthContext'

export default function Orders() {
  const { user } = useAuth()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Empty State */}
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons
            name="cart-outline"
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
            Nenhuma compra realizada
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              paddingHorizontal: 40,
            }}
          >
            Quando você fizer pedidos, eles aparecerão aqui
          </Text>
        </View>

        {/* TODO: Adicionar lista de pedidos */}
      </ScrollView>
    </View>
  )
}
