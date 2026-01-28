// app/(tabs)/profile/business-profile.tsx
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
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { profileService } from '@/services/profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { colors, components } from '@/theme'
import { validators } from '@/utils/validators'
import { ProfileHeader } from '@/components/ui/ProfileHeader'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  nickName?: string
  bio?: string
}

export default function BusinessProfile() {
  const router = useRouter()
  const { user, updateUser } = useAuth()

  const [nickName, setNickName] = useState('')
  const [bio, setBio] = useState('')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (user) {
      setNickName(user.nickName || '')
      setBio(user.bio || '')
      setCategory(user.category || '')
    }
  }, [user])

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setIsLoading(true)

      const newErrors: FormErrors = {}

      if (!nickName.trim()) {
        newErrors.nickName = 'Apelido é obrigatório'
      } else if (!validators.nickName(nickName)) {
        newErrors.nickName = 'Apelido deve ter entre 3 e 20 caracteres'
      }

      if (bio && bio.length > 2000) {
        newErrors.bio = 'Biografia muito longa (máximo 2000 caracteres)'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const { user: updatedUser } = await profileService.updateBusinessProfile({
        nickName: nickName.trim(),
        bio: bio.trim(),
        category: category || undefined,
      })

      updateUser(updatedUser)

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ])
    } catch (error: unknown) {
      console.error('Error updating business profile:', error)
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
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
          {/* Info Banner */}
          <View
            style={{
              backgroundColor: colors.primary + '10',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textPrimary,
                lineHeight: 20,
              }}
            >
              Complete seu perfil de negócio para aparecer nas buscas e atrair
              mais clientes.
            </Text>
          </View>

          {/* NickName */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Apelido/Nome do Negócio</Text>
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
              placeholder="meurestaurante"
              autoCapitalize="none"
              maxLength={20}
            />
            {errors.nickName && (
              <Text style={components.auth.errorText}>{errors.nickName}</Text>
            )}
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {nickName.length}/20 caracteres
            </Text>
          </View>

          {/* Bio */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Biografia do Negócio</Text>
            <TextInput
              style={[
                components.input.container,
                components.input.text,
                errors.bio && components.input.error,
                { height: 120, textAlignVertical: 'top', paddingTop: 12 },
              ]}
              value={bio}
              onChangeText={(text) => {
                setBio(text)
                setErrors((prev) => ({ ...prev, bio: undefined }))
                setApiErrors(null)
              }}
              placeholder="Conte sobre seu negócio, o que oferece, horários..."
              multiline
              numberOfLines={5}
              maxLength={2000}
            />
            {errors.bio && (
              <Text style={components.auth.errorText}>{errors.bio}</Text>
            )}
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {bio.length}/2000 caracteres
            </Text>
          </View>

          {/* Category */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Categoria (opcional)</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={category}
              onChangeText={(text) => {
                setCategory(text)
                setApiErrors(null)
              }}
              placeholder="Ex: Restaurante, Mercado, Padaria..."
            />
          </View>

          <ErrorMessage errors={apiErrors} />

          {/* Submit Button */}
          <TouchableOpacity
            style={components.auth.buttonPrimary}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={components.auth.buttonText}>
                Salvar Perfil do Negócio
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}
