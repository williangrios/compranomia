import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/layout/Screen'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { ProfilePhotoSelector } from '@/components/profile/ProfilePhotoSelector'
import { profileService } from '@/services/profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { colors, components } from '@/theme'
import { validators } from '@/utils/validators'
import { Language, UserCategory } from '@wrcb/cb-common'
import { getCategoriesList, getCategoryName } from '@/utils/businessCategories'

interface ApiError {
  message: string
  field?: string
}

interface SuccessResponse {
  status?: 'success'
  message?: string
}

interface FormErrors {
  nickName?: string
  bio?: string
  category?: string
}

export default function BusinessProfile() {
  const router = useRouter()
  const { user, updateUser } = useAuth()

  // Form data
  const [email, setEmail] = useState('')
  const [nickName, setNickName] = useState('')
  const [bio, setBio] = useState('')
  const [category, setCategory] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [profilePhotoFile, setProfilePhotoFile] = useState<{
    uri: string
    name: string
    type: string
  } | null>(null)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [successMessage, setSuccessMessage] = useState<SuccessResponse | null>(
    null,
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoadingData(true)
        const { user: userData } = await profileService.getCurrentUserData()
        setEmail(userData.email || '')
        setNickName(userData.nickName || '')
        setBio(userData.bio || '')
        setCategory(userData.category || '')
        setProfilePhoto(userData.profilePhoto || '')
      } catch (error) {
        console.error('Error loading user data:', error)
        setApiErrors([{ message: 'Não foi possível carregar seus dados' }])
      } finally {
        setIsLoadingData(false)
      }
    }

    loadUserData()
  }, [])

  // Validate form
  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (!nickName.trim()) {
      newErrors.nickName = 'Apelido é obrigatório'
    } else if (!validators.nickName(nickName)) {
      newErrors.nickName = 'Entre 3 e 20 caracteres'
    }

    if (!bio.trim()) {
      newErrors.bio = 'Biografia é obrigatória'
    } else if (bio.length > 2000) {
      newErrors.bio = 'Máximo 2000 caracteres'
    }

    if (!category) {
      newErrors.category = 'Selecione uma categoria'
    }

    if (!profilePhoto && !profilePhotoFile) {
      setApiErrors([{ message: 'ProfilePhotoRequired' }])
      return false
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  async function handleSubmit() {
    // Limpar mensagens anteriores
    setApiErrors(null)
    setSuccessMessage(null)

    if (!validateForm()) return

    try {
      setIsLoading(true)

      // SEMPRE enviar Português
      const iSpeakLanguages = [Language.Português]

      // Se tem foto nova, usa FormData
      if (profilePhotoFile) {
        const formData = new FormData()
        formData.append('nickName', nickName.trim())
        formData.append('bio', bio.trim())
        formData.append('category', category)

        // @ts-ignore - React Native FormData aceita file object
        formData.append('profilePhoto', {
          uri: profilePhotoFile.uri,
          name: profilePhotoFile.name,
          type: profilePhotoFile.type,
        })

        // Arrays
        iSpeakLanguages.forEach((lang) => {
          formData.append('iSpeakLanguages', lang)
        })

        const { user: updatedUser } =
          await profileService.updateBusinessProfileWithPhoto(formData)
        updateUser(updatedUser)
      } else {
        // Sem foto, usa JSON
        const { user: updatedUser } =
          await profileService.updateBusinessProfile({
            nickName: nickName.trim(),
            bio: bio.trim(),
            category,
            iSpeakLanguages,
          })
        updateUser(updatedUser)
      }

      // Mostrar mensagem de sucesso
      setSuccessMessage({
        status: 'success',
        message: 'Perfil atualizado com sucesso',
      })
    } catch (error: any) {
      // Extrair mensagem de erro
      const errorMessage = error.message || 'Erro ao atualizar perfil'

      setApiErrors([{ message: errorMessage }])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Screen>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
            Carregando dados...
          </Text>
        </View>
      </Screen>
    )
  }

  const categoriesList = getCategoriesList()

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Foto de perfil */}
        <ProfilePhotoSelector
          currentPhoto={profilePhoto}
          onPhotoSelected={(uri, file) => {
            setProfilePhoto(uri)
            setProfilePhotoFile(file)
          }}
          onPhotoRemoved={() => {
            setProfilePhoto('')
            setProfilePhotoFile(null)
          }}
        />

        {/* Email (read-only) */}
        <View style={{ marginBottom: 16 }}>
          <Text style={components.input.label}>E-mail</Text>
          <View
            style={[
              components.input.container,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="mail"
              size={20}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[components.input.text, { color: colors.textSecondary }]}
            >
              {email}
            </Text>
          </View>
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
          >
            O e-mail não pode ser alterado
          </Text>
        </View>

        {/* Apelido */}
        <View style={{ marginBottom: 16 }}>
          <Text style={components.input.label}>Nome do Negócio *</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[
                components.input.container,
                components.input.text,
                errors.nickName && components.input.error,
                { flex: 1 },
              ]}
              value={nickName}
              onChangeText={(text) => {
                setNickName(text)
                setErrors((prev) => ({ ...prev, nickName: undefined }))
                setApiErrors(null)
                setSuccessMessage(null)
              }}
              maxLength={20}
              placeholder="Digite seu apelido"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
          >
            {nickName.length}/20 caracteres
          </Text>
          {errors.nickName && (
            <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>
              {errors.nickName}
            </Text>
          )}
        </View>

        {/* Bio */}
        <View style={{ marginBottom: 16 }}>
          <Text style={components.input.label}>Biografia *</Text>
          <TextInput
            style={[
              components.input.container,
              components.input.text,
              errors.bio && components.input.error,
              {
                height: 120,
                textAlignVertical: 'top',
                paddingTop: 12,
              },
            ]}
            value={bio}
            onChangeText={(text) => {
              setBio(text)
              setErrors((prev) => ({ ...prev, bio: undefined }))
              setApiErrors(null)
              setSuccessMessage(null)
            }}
            multiline
            maxLength={2000}
            placeholder="Conte sobre seu negócio..."
            placeholderTextColor={colors.textSecondary}
          />
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
          >
            {bio.length}/2000 caracteres
          </Text>
          {errors.bio && (
            <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>
              {errors.bio}
            </Text>
          )}
        </View>

        {/* Categoria */}
        {/* Categoria */}
        <View style={{ marginBottom: 16 }}>
          <Text style={components.input.label}>Categoria *</Text>
          <TouchableOpacity
            style={[
              components.input.container,
              errors.category && components.input.error,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
            onPress={() => {
              setShowCategoryDropdown(!showCategoryDropdown)
              setApiErrors(null)
              setSuccessMessage(null)
            }}
          >
            <Text
              style={[
                components.input.text,
                !category && { color: colors.textSecondary },
              ]}
            >
              {category
                ? getCategoryName(category as UserCategory)
                : 'Selecione uma categoria'}
            </Text>
            <Ionicons
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Modal para categorias */}
          {showCategoryDropdown && (
            <Modal
              visible={showCategoryDropdown}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCategoryDropdown(false)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'flex-end',
                }}
                onPress={() => setShowCategoryDropdown(false)}
              >
                <Pressable
                  style={{
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    maxHeight: '70%',
                  }}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.textPrimary,
                      }}
                    >
                      Selecione a categoria
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCategoryDropdown(false)}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <ScrollView>
                    {categoriesList.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={{
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onPress={() => {
                          setCategory(cat)
                          setShowCategoryDropdown(false)
                          setErrors((prev) => ({
                            ...prev,
                            category: undefined,
                          }))
                          setApiErrors(null)
                          setSuccessMessage(null)
                        }}
                      >
                        <Text
                          style={{
                            color:
                              category === cat
                                ? colors.primary
                                : colors.textPrimary,
                            fontWeight: category === cat ? '600' : '400',
                            fontSize: 16,
                          }}
                        >
                          {getCategoryName(cat as UserCategory)}
                        </Text>
                        {category === cat && (
                          <Ionicons
                            name="checkmark"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>
          )}

          {errors.category && (
            <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>
              {errors.category}
            </Text>
          )}
        </View>

        {/* Success message */}
        <SuccessMessage success={successMessage} />

        {/* Error messages */}
        <ErrorMessage errors={apiErrors} />

        {/* Submit button */}
        <TouchableOpacity
          style={[
            components.auth.buttonPrimary,
            { marginTop: 24, marginBottom: 40 },
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
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
    </Screen>
  )
}
