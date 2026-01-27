// app/(auth)/signup.tsx
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
import { Ionicons } from '@expo/vector-icons'
import { UserRole } from '@wrcb/cb-common'
import { colors, components } from '@/theme'
import { validators } from '@/utils/validators'
import { useAuth } from '@/contexts/AuthContext'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

interface ApiError {
  message: string
  field?: string
}

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  const params = useLocalSearchParams()
  const role = (params.role as string) || 'consumer'
  const isSeller = role === 'seller'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [nickName, setNickName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    passwordConfirmation?: string
    nickName?: string
  }>({})

  async function handleSignUp() {
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

      if (!nickName) {
        newErrors.nickName = 'Apelido é obrigatório'
      } else if (!validators.nickName(nickName)) {
        newErrors.nickName = 'Apelido deve ter entre 3 e 20 caracteres'
      }

      if (!password) {
        newErrors.password = 'Senha é obrigatória'
      } else if (!validators.password(password)) {
        newErrors.password = 'Senha deve ter entre 6 e 30 caracteres'
      }

      if (!passwordConfirmation) {
        newErrors.passwordConfirmation = 'Confirmação de senha é obrigatória'
      } else if (password !== passwordConfirmation) {
        newErrors.passwordConfirmation = 'Senhas não conferem'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      console.log('📤 handleSignUp - Chamando signUp do AuthContext')

      await signUp({
        email: email.toLowerCase().trim(),
        password,
        passwordConfirmation,
        nickName: nickName.trim(),
        role: isSeller ? UserRole.Seller : UserRole.Consumer,
      })

      console.log('✅ handleSignUp - SignUp sucesso, redirecionando...')

      // Redirecionar para verificação de email
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.toLowerCase().trim() },
      })
    } catch (error: any) {
      console.error('❌ handleSignUp - Erro capturado:', error)
      console.error('❌ handleSignUp - error.errors:', error.errors)

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
            <Ionicons
              name={isSeller ? 'storefront' : 'cart'}
              size={64}
              color={isSeller ? colors.success : colors.primary}
            />
            <Text style={components.auth.title}>Criar conta</Text>
            <Text style={components.auth.subtitle}>
              {isSeller
                ? 'Comece a vender online'
                : 'Compre com facilidade e rapidez'}
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

            {/* Apelido */}
            <View>
              <Text style={components.input.label}>Apelido</Text>
              <TextInput
                style={[
                  components.input.container,
                  components.input.text,
                  errors.nickName && components.input.error,
                ]}
                value={nickName}
                onChangeText={(text) => {
                  setNickName(text)
                  setErrors((prev) => ({ ...prev, nickName: undefined }))
                  setApiErrors(null)
                }}
                placeholder="Como quer ser chamado?"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
              {errors.nickName && (
                <Text style={components.auth.errorText}>{errors.nickName}</Text>
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
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Senha */}
            <View>
              <Text style={components.input.label}>Confirmar senha</Text>
              <TextInput
                style={[
                  components.input.container,
                  components.input.text,
                  errors.passwordConfirmation && components.input.error,
                ]}
                value={passwordConfirmation}
                onChangeText={(text) => {
                  setPasswordConfirmation(text)
                  setErrors((prev) => ({
                    ...prev,
                    passwordConfirmation: undefined,
                  }))
                  setApiErrors(null)
                }}
                placeholder="Digite a senha novamente"
                secureTextEntry={!showPassword}
              />
              {errors.passwordConfirmation && (
                <Text style={components.auth.errorText}>
                  {errors.passwordConfirmation}
                </Text>
              )}
            </View>

            {/* Erros da API */}
            <ErrorMessage errors={apiErrors} />

            {/* Botão Criar conta */}
            <TouchableOpacity
              style={components.auth.buttonPrimary}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={components.auth.buttonText}>Criar conta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Voltar */}
          <TouchableOpacity
            style={components.auth.linkContainer}
            onPress={() => router.back()}
          >
            <Text style={components.auth.linkTextSmall}>
              Já tem conta? Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
