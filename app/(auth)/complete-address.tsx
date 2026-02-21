// app/(auth)/complete-address.tsx
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, components, spacing } from '@/theme'
import { useAuth } from '@/contexts/AuthContext'
import { AddressForm } from '@/components/forms/AddressForm'
import { useAddress } from '@/contexts/AddressContext'

export default function CompleteAddress() {
  const { user, updateUser } = useAuth()
  const { checkIfHasDeliveryAddress } = useAddress()

  async function handleSuccess() {
    if (user) {
      const updatedUser = { ...user, isAddressDataProvided: true }
      updateUser(updatedUser)
    }
    await checkIfHasDeliveryAddress()
    // AuthContext vai redirecionar automaticamente para (tabs)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={components.auth.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={components.auth.container}>
          {/* Header */}
          <View
            style={[
              components.auth.header,
              { paddingTop: spacing.xl + spacing.sm },
            ]}
          >
            <Ionicons name="location" size={64} color={colors.primary} />
            <Text style={components.auth.title}>Seu endereço</Text>
            <Text style={components.auth.subtitle}>
              Informe seu endereço para finalizar o cadastro
            </Text>
          </View>

          {/* Form */}
          <View style={components.auth.formContainer}>
            <AddressForm
              isDefault={true}
              onSuccess={handleSuccess}
              submitButtonText="Continuar"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
