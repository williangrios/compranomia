// app/(tabs)/profile/update-password.tsx
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { colors, components } from '@/theme'
import { Screen } from '@/components/layout/Screen'
import { useAuth } from '@/contexts/AuthContext'

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
  const { updatePassword } = useAuth()

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

      if (!password.trim()) newErrors.password = 'Digite a senha atual'
      if (!newPassword.trim()) newErrors.newPassword = 'Digite a nova senha'
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

      await updatePassword({
        currentPassword: password.trim(),
        newPassword: newPassword.trim(),
        newPasswordConfirmation: newPasswordConfirmation.trim(),
      })

      setPassword('')
      setNewPassword('')
      setNewPasswordConfirmation('')

      setSuccess({ message: 'Senha atualizada com sucesso' })
    } catch (error: any) {
      setApiErrors(error.errors)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Screen>
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
            setErrors((p) => ({ ...p, password: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          secureTextEntry
        />
        {errors.password && (
          <Text style={components.auth.errorText}>{errors.password}</Text>
        )}
      </View>

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
            setErrors((p) => ({ ...p, newPassword: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          secureTextEntry
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Confirmação da nova senha</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.newPasswordConfirmation && components.input.error,
          ]}
          value={newPasswordConfirmation}
          onChangeText={(text) => {
            setNewPasswordConfirmation(text)
            setErrors((p) => ({
              ...p,
              newPasswordConfirmation: undefined,
            }))
            setApiErrors(null)
            setSuccess(null)
          }}
          secureTextEntry
        />
      </View>

      <SuccessMessage success={success} />
      <ErrorMessage errors={apiErrors} />

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
    </Screen>
  )
}
