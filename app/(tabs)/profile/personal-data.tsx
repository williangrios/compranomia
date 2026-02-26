import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { profileService } from '@/services/profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { Screen } from '@/components/layout/Screen'
import { getApiErrors } from '@/utils/getApiErrors'
import { Tenant, TenantDataService, UserRole } from '@wrcb/cb-common'
import { tenantData } from '@/utils/constants'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  name?: string
  doc?: string
  birthDate?: string
  whatsapp?: string
}

export default function PersonalData() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState('')
  const [doc, setDoc] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const WHATSAPP_BUSINESS_NUMBER = '55' + tenantData.SITE_WHATSAPP_BOT

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setDoc(user.doc ? formatters.cpf(user.doc) : '')
      setBirthDate(user.birthDate ? formatters.date(user.birthDate) : '')
      setWhatsapp(user.whatsapp ? formatters.phone(user.whatsapp) : '')
      setPhoneNumber(user.phoneNumber ? formatters.phone(user.phoneNumber) : '')
    }
  }, [user])

  const isSeller = user?.role === UserRole.Seller
  const isWhatsappSaved = !!user?.whatsapp && user.whatsapp.length > 0
  const showVerifyButton =
    isSeller && isWhatsappSaved && !user?.isWhatsappVerified

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setSuccess(null)
      setIsLoading(true)

      const newErrors: FormErrors = {}

      if (!name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }

      if (!doc.trim()) {
        newErrors.doc = 'CPF é obrigatório'
      }

      if (!birthDate.trim()) {
        newErrors.birthDate = 'Data de nascimento é obrigatória'
      }

      // Validação condicional para Seller
      if (isSeller && !whatsapp.trim()) {
        newErrors.whatsapp = 'WhatsApp é obrigatório para vendedores'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const response = await profileService.updatePersonalData({
        name: name.trim(),
        doc: formatters.cleanCPF(doc),
        birthDate: birthDate ? formatters.cleanDate(birthDate) : null,
        whatsapp: whatsapp.trim() ? formatters.cleanPhone(whatsapp) : '',
        phoneNumber: phoneNumber.trim()
          ? formatters.cleanPhone(phoneNumber)
          : '',
      })

      updateUser(response.user)

      setSuccess({
        message: 'Dados atualizados com sucesso',
      })
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyWhatsApp() {
    try {
      if (!user?.whatsapp) {
        Alert.alert('Erro', 'Salve seu WhatsApp antes de verificar')
        return
      }

      const message = 'Oi, quero verificar meu numero de whatsapp'
      const url = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`

      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp')
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error)
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp')
    }
  }

  async function handleRefreshVerification() {
    try {
      setIsRefreshing(true)
      const response = await profileService.refreshUserData()
      updateUser(response.user)

      if (response.user.isWhatsappVerified) {
        setSuccess({
          message: '✅ WhatsApp verificado com sucesso!',
        })
      } else {
        Alert.alert(
          'Ooops..',
          'Seu WhatsApp ainda não foi verificado. Envie a mensagem e tente novamente.',
        )
      }
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Screen>
      {/* Nome */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Nome Completo</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.name && components.input.error,
          ]}
          value={name}
          onChangeText={(text) => {
            setName(text)
            setErrors((prev) => ({ ...prev, name: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="Seu nome completo"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
        />
        {errors.name && (
          <Text style={components.auth.errorText}>{errors.name}</Text>
        )}
      </View>

      {/* CPF */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>CPF</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.doc && components.input.error,
          ]}
          value={doc}
          onChangeText={(text) => {
            setDoc(formatters.cpf(text))
            setErrors((prev) => ({ ...prev, doc: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="000.000.000-00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={14}
        />
        {errors.doc && (
          <Text style={components.auth.errorText}>{errors.doc}</Text>
        )}
      </View>

      {/* Data de nascimento */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Data de Nascimento</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.birthDate && components.input.error,
          ]}
          value={birthDate}
          onChangeText={(text) => {
            setBirthDate(formatters.dateMask(text))
            setErrors((prev) => ({ ...prev, birthDate: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={10}
        />
        {errors.birthDate && (
          <Text style={components.auth.errorText}>{errors.birthDate}</Text>
        )}
      </View>

      {/* WhatsApp */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>WhatsApp</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.whatsapp && components.input.error,
          ]}
          value={whatsapp}
          onChangeText={(text) => {
            setWhatsapp(formatters.phone(text))
            setErrors((prev) => ({ ...prev, whatsapp: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="(00) 00000-0000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          maxLength={15}
        />
        {errors.whatsapp && (
          <Text style={components.auth.errorText}>{errors.whatsapp}</Text>
        )}

        {/* Status de verificação */}
        {user?.isWhatsappVerified && (
          <Text
            style={{
              color: colors.success,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            ✅ WhatsApp verificado
          </Text>
        )}
      </View>
      {/* Botão Verificar WhatsApp */}
      {showVerifyButton && (
        <>
          <TouchableOpacity
            style={[
              components.auth.buttonPrimary,
              {
                backgroundColor: colors.success,
                marginBottom: 12,
              },
            ]}
            onPress={handleVerifyWhatsApp}
            activeOpacity={0.8}
          >
            <Text style={components.auth.buttonText}>
              📱 Verificar WhatsApp
            </Text>
          </TouchableOpacity>

          {/* Botão Atualizar Status */}
          <TouchableOpacity
            style={[
              components.auth.buttonPrimary,
              {
                backgroundColor: colors.border,
              },
            ]}
            onPress={handleRefreshVerification}
            disabled={isRefreshing}
            activeOpacity={0.8}
          >
            {isRefreshing ? (
              <ActivityIndicator color={colors.primaryDark} />
            ) : (
              <Text
                style={[
                  components.auth.buttonText,
                  { color: colors.primaryDark },
                ]}
              >
                🔄 Já enviei a mensagem
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Telefone */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Telefone (opcional)</Text>
        <TextInput
          style={[components.input.container, components.input.text]}
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(formatters.phone(text))
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="(00) 00000-0000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <SuccessMessage success={success} />
      <ErrorMessage errors={apiErrors} />

      {/* Botão Salvar Dados */}
      <TouchableOpacity
        style={[
          components.auth.buttonPrimary,
          { marginBottom: showVerifyButton ? 12 : 0 },
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={components.auth.buttonText}>Salvar Dados</Text>
        )}
      </TouchableOpacity>
    </Screen>
  )
}
