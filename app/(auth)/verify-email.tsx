// app/(auth)/verify-email.tsx
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
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/contexts/AuthContext'
import { colors, components } from '@/theme'
import { validators } from '@/utils/validators'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { getApiErrors } from '@/utils/getApiErrors'
import { Screen } from '@/components/layout/Screen'

interface ApiError {
  message: string
  field?: string
}

export default function VerifyEmail() {
  const router = useRouter()
  const { resendVerificationCode, verifyEmail, user, logout } = useAuth()
  const params = useLocalSearchParams()
  const email = (params.email as string) || user?.email || ''

  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [localError, setLocalError] = useState('')

  async function handleVerify() {
    try {
      setLocalError('')
      setApiErrors(null)
      setIsLoading(true)

      // Validações locais
      if (!code) {
        setLocalError('Código é obrigatório')
        return
      }

      if (!validators.verificationCode(code)) {
        setLocalError('Código deve ter 6 dígitos')
        return
      }

      await verifyEmail(email, code)
      setIsVerified(true)

      // AuthContext vai redirecionar automaticamente baseado no role:
      // - Consumer sem endereço → complete-address
      // - Seller ou Consumer com endereço → (tabs)
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    try {
      setLocalError('')
      setApiErrors(null)
      setIsResending(true)

      await resendVerificationCode()
    } catch (error: any) {
      setApiErrors(getApiErrors(error)) // ← ISSO é o que faz aparecer no ErrorMessage
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Screen>
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
              <Icon icon="Mail" size={64} color={colors.primary} />
              <Text style={components.auth.title}>Confirmar e-mail</Text>
              <Text style={components.auth.subtitle}>
                Digite o código de 6 dígitos enviado para{'\n'}
                {email || 'seu email'}
              </Text>
            </View>

            {/* Form */}
            <View style={components.auth.formContainer}>
              {/* Código */}
              <View>
                <Text style={components.input.label}>
                  Código de verificação
                </Text>
                <TextInput
                  style={[
                    components.input.container,
                    components.input.text,
                    localError && components.input.error,
                    { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
                  ]}
                  value={code}
                  onChangeText={(text) => {
                    // Apenas números
                    const cleaned = text.replace(/\D/g, '')
                    setCode(cleaned)
                    setLocalError('')
                    setApiErrors(null)
                  }}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                {localError && (
                  <Text style={components.auth.errorText}>{localError}</Text>
                )}
              </View>

              {/* Erros da API */}
              <ErrorMessage errors={apiErrors} />

              {/* Botão Verificar */}
              <TouchableOpacity
                style={components.auth.buttonPrimary}
                onPress={handleVerify}
                disabled={isLoading || isVerified || code.length !== 6}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={components.auth.buttonText}>Verificar</Text>
                )}
              </TouchableOpacity>

              {/* Reenviar código */}
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text
                  style={[components.auth.linkText, { textAlign: 'center' }]}
                >
                  {isResending
                    ? 'Reenviando...'
                    : 'Não recebeu? Reenviar código'}
                </Text>
              </TouchableOpacity>

              {resendSuccess && (
                <Text
                  style={{ textAlign: 'center', color: 'green', marginTop: 8 }}
                >
                  Novo código enviado com sucesso!
                </Text>
              )}
            </View>

            {/* Logout */}
            <TouchableOpacity
              style={components.auth.linkContainer}
              onPress={logout}
            >
              <Text style={components.auth.linkTextSmall}>Sair</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
