// app/(auth)/welcome.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { colors, components, spacing } from '@/theme'
import { tenantData } from '@/utils/constants'
import { Screen } from '@/components/layout/Screen'

export default function Welcome() {
  const router = useRouter()

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View style={components.auth.container}>
          {/* Header */}
          <View style={components.auth.header}>
            <Text style={components.auth.title}>{tenantData.SITE_NAME}</Text>
            <Text style={components.auth.subtitle}>
              Mercado completo na palma da sua mão
            </Text>
          </View>

          {/* Botões principais */}
          <View style={components.auth.formContainer}>
            {/* Criar conta (Consumer) */}
            <TouchableOpacity
              style={components.auth.buttonPrimary}
              onPress={() => router.push('/(auth)/signup?role=consumer')}
              activeOpacity={0.8}
            >
              <Text style={components.auth.buttonText}>Criar conta</Text>
            </TouchableOpacity>

            {/* Entrar */}
            <TouchableOpacity
              style={components.auth.buttonSecondary}
              onPress={() => router.push('/(auth)/signin')}
              activeOpacity={0.8}
            >
              <Text style={components.auth.buttonTextSecondary}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Link discreto para vendedores - RODAPÉ */}
        <View
          style={{
            position: 'absolute',
            bottom: spacing.xl,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup?role=seller')}
          >
            <Text style={components.auth.linkTextSmall}>Quero vender</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}
