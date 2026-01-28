// app/(tabs)/index.tsx
import { View, Text, ScrollView } from 'react-native'
import { Header } from '@/components/ui/Header'
import { colors } from '@/theme'

export default function Home() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.textPrimary,
          }}
        >
          Bem-vindo ao Compranomia! 🛒
        </Text>
        <Text
          style={{ fontSize: 16, color: colors.textSecondary, marginTop: 8 }}
        >
          Encontre produtos e serviços perto de você
        </Text>
      </ScrollView>
    </View>
  )
}
