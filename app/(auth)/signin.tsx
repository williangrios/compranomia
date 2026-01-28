// app/(auth)/signin.tsx
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
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, components } from '@/theme'
import { validators } from '@/utils/validators'
import { useAuth } from '@/contexts/AuthContext'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

interface ApiError {
  message: string
  field?: string
}

export default function SignIn() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('williangrios@yahoo.com.br')
  const [password, setPassword] = useState('123123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )

  async function handleSignIn() {
    try {
      setErrors({})
      setApiErrors(null)
      setIsLoading(true)

      // Validações locais
      const newErrors: typeof errors = {}

      if (!email) {
        newErrors.email = 'Email é obrigatório'
      } else if (!validators.email(email)) {
        newErrors.email = 'Email inválido'
      }

      if (!password) {
        newErrors.password = 'Senha é obrigatória'
      } else if (!validators.password(password)) {
        newErrors.password = 'Senha deve ter entre 6 e 30 caracteres'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      console.log('📤 handleSignIn - Chamando signIn do AuthContext')

      await signIn(email.toLowerCase().trim(), password)

      console.log('✅ handleSignIn - Login sucesso')
      // AuthContext vai redirecionar automaticamente
    } catch (error: any) {
      console.error('❌ handleSignIn - Erro capturado:', error)
      console.error('❌ handleSignIn - error.errors:', error.errors)

      // Capturar erros da API (já formatados pelo AuthContext)
      if (error.errors && Array.isArray(error.errors)) {
        console.log('✅ Setando apiErrors:', error.errors)
        setApiErrors(error.errors)
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
            <Ionicons name="log-in" size={64} color={colors.primary} />
            <Text style={components.auth.title}>Entrar</Text>
            <Text style={components.auth.subtitle}>
              Acesse sua conta no Compranomia
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
                  errors.email && components.input.error,
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setErrors((prev) => ({ ...prev, email: undefined }))
                  setApiErrors(null)
                }}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={components.auth.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Senha */}
            <View>
              <Text style={components.input.label}>Senha</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[
                    components.input.container,
                    components.input.text,
                    errors.password && components.input.error,
                  ]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    setErrors((prev) => ({ ...prev, password: undefined }))
                    setApiErrors(null)
                  }}
                  placeholder="Sua senha"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={components.auth.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Esqueci minha senha */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={components.auth.linkText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {/* Erros da API */}
            <ErrorMessage errors={apiErrors} />

            {/* Botão Entrar */}
            <TouchableOpacity
              style={components.auth.buttonPrimary}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={components.auth.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link para criar conta */}
          <TouchableOpacity
            style={components.auth.linkContainer}
            onPress={() => router.push('/(auth)/welcome')}
          >
            <Text style={components.auth.linkTextSmall}>
              Não tem conta? Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
