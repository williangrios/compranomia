// app/(tabs)/search.tsx
import { useState } from 'react'
import { View, Text, TextInput, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { colors, components } from '@/theme'

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <View style={{ padding: 16 }}>
        {/* Search Input */}
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[
              components.input.container,
              components.input.text,
              { paddingLeft: 40 },
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar produtos ou lojas..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={{ position: 'absolute', left: 12, top: 16 }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
          }}
        >
          Digite para buscar produtos ou lojas
        </Text>

        {/* TODO: Adicionar categorias, resultados de busca, etc */}
      </ScrollView>
    </View>
  )
}
