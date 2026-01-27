// app/(auth)/forgot-password.tsx
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, components } from '@/theme'
import { validators } from '@/utils/validators'
import { Tenant } from '@wrcb/cb-common'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import api from '@/services/api'

interface ApiError {
  message: string
  field?: string
}

export default function ForgotPassword() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    try {
      setLocalError('')
      setApiErrors(null)
      setIsLoading(true)

      // Validação local
      if (!email) {
        setLocalError('Email é obrigatório')
        return
      }

      if (!validators.email(email)) {
        setLocalError('Email inválido')
        return
      }

      console.log('📤 handleSubmit - Enviando requisição para gerar nova senha')

      const response = await api.post('/api/auth/generatenewpassword', {
        email: email.toLowerCase().trim(),
        tenant: Tenant.Compranomia,
      })

      console.log('✅ handleSubmit - Nova senha enviada com sucesso')

      setSuccess(true)

      Alert.alert('Sucesso!', 'Uma nova senha foi enviada para seu email.', [
        {
          text: 'OK',
          onPress: () => router.push('/(auth)/signin'),
        },
      ])
    } catch (error: any) {
      console.error('❌ handleSubmit - Erro capturado:', error)
      console.error('❌ handleSubmit - error.response:', error.response)

      // Capturar erros da API
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        console.log('✅ Setando apiErrors:', error.response.data.errors)
        setApiErrors(error.response.data.errors)
      } else {
        console.log('❌ Erro sem estrutura correta, usando GenericError')
        setApiErrors([{ message: 'GenericError' }])
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={components.auth.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={components.auth.container}>
          {/* Header */}
          <View style={components.auth.header}>
            <Ionicons name="key" size={64} color={colors.primary} />
            <Text style={components.auth.title}>Esqueci minha senha</Text>
            <Text style={components.auth.subtitle}>
              Digite seu email para receber uma nova senha
            </Text>
          </View>

          {/* Form */}
          <View style={components.auth.formContainer}>
            {/* Email */}
            <View>
              <Text style={components.input.label}>Email</Text>
              <TextInput
                style={[
                  components.input.container,
                  components.input.text,
                  localError && components.input.error,
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setLocalError('')
                  setApiErrors(null)
                }}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!success}
              />
              {localError && (
                <Text style={components.auth.errorText}>{localError}</Text>
              )}
            </View>

            {/* Erros da API */}
            <ErrorMessage errors={apiErrors} />

            {/* Botão Enviar */}
            <TouchableOpacity
              style={components.auth.buttonPrimary}
              onPress={handleSubmit}
              disabled={isLoading || success}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={components.auth.buttonText}>
                  Enviar nova senha
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Voltar */}
          <TouchableOpacity
            style={components.auth.linkContainer}
            onPress={() => router.back()}
          >
            <Text style={components.auth.linkTextSmall}>Voltar para login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
