// app/(tabs)/sales/index.tsx
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/layout/Screen'
import { colors } from '@/theme'

export default function Sales() {
  return (
    <Screen>
      {/* Empty State */}
      <View style={{ alignItems: 'center', paddingVertical: 80 }}>
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
          Nenhuma venda realizada
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            paddingHorizontal: 40,
          }}
        >
          Quando você receber pedidos, eles aparecerão aqui
        </Text>
      </View>
    </Screen>
  )
}
