import { useState, useEffect } from 'react'
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
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { profileService } from '@/services/profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  password?: string
  newPassword?: string
  newPasswordConfirmation?: string
}

export default function UpdatePassword() {
  const { user, updateUser } = useAuth()

  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setSuccess(null)
      setIsLoading(true)

      const newErrors: FormErrors = {}

      if (!password.trim()) {
        newErrors.password = 'Digite a senha atual'
      }

      if (!newPassword.trim()) {
        newErrors.newPassword = 'Digite a nova senha'
      }

      if (!newPasswordConfirmation.trim()) {
        newErrors.newPasswordConfirmation = 'Confirme a nova senha'
      }

      if (newPassword !== newPasswordConfirmation) {
        newErrors.newPasswordConfirmation = 'As senhas não coincidem'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // const response = await passwordService.updatePassword({
      //   password: password.trim(),
      //   newPassword: newPassword.trim(),
      //   newPasswordConfirmation: newPasswordConfirmation.trim(),
      // })

      setSuccess({
        message: 'Senha atualizada com sucesso',
      })
    } catch (error: any) {
      console.error('❌ handleSubmit - Erro capturado:', error)

      setSuccess(null)

      if (error?.errors && Array.isArray(error.errors)) {
        setApiErrors(error.errors)
      } else {
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Senha atual */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Senha atual</Text>
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
                setSuccess(null)
              }}
              placeholder="Sua senha atual"
              autoCapitalize="words"
              maxLength={20}
            />
            {errors.password && (
              <Text style={components.auth.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Nova senha */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Nova senha</Text>
            <TextInput
              style={[
                components.input.container,
                components.input.text,
                errors.newPassword && components.input.error,
              ]}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                setErrors((prev) => ({ ...prev, newPassword: undefined }))
                setApiErrors(null)
                setSuccess(null)
              }}
              placeholder="Nova senha"
              autoCapitalize="words"
              maxLength={20}
            />
            {errors.newPassword && (
              <Text style={components.auth.errorText}>
                {errors.newPassword}
              </Text>
            )}
          </View>

          {/* Confirmação da nova senha */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>
              Confirmação da Nova Senha
            </Text>
            <TextInput
              style={[
                components.input.container,
                components.input.text,
                errors.newPasswordConfirmation && components.input.error,
              ]}
              value={newPasswordConfirmation}
              onChangeText={(text) => {
                setNewPasswordConfirmation(text)
                setErrors((prev) => ({
                  ...prev,
                  newPasswordConfirmation: undefined,
                }))
                setApiErrors(null)
                setSuccess(null)
              }}
              placeholder="Confirmação da nova senha"
              autoCapitalize="words"
              maxLength={20}
            />
            {errors.newPasswordConfirmation && (
              <Text style={components.auth.errorText}>
                {errors.newPasswordConfirmation}
              </Text>
            )}
          </View>

          {/* Feedback */}
          <SuccessMessage success={success} />
          <ErrorMessage errors={apiErrors} />

          {/* Botão salvar */}
          <TouchableOpacity
            style={components.auth.buttonPrimary}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={components.auth.buttonText}>Salvar nova senha</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}
