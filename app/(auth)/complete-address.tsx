// app/(auth)/complete-address.tsx
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
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { AddressType } from '@/types/address.types'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { validators } from '@/utils/validators'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useAuth } from '@/contexts/AuthContext'

interface ApiError {
  message: string
  field?: string
}

export default function CompleteAddress() {
  const router = useRouter()
  const { user, updateUser } = useAuth()

  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [label, setLabel] = useState<AddressType>(AddressType.Casa)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [errors, setErrors] = useState<{
    cep?: string
    number?: string
    neighborhood?: string
  }>({})

  // Buscar endereço por CEP
  async function handleCEPSearch(cepValue: string) {
    const cleanCEP = formatters.cleanCEP(cepValue)

    if (cleanCEP.length !== 8) return

    try {
      setIsLoadingCEP(true)
      const address = await deliveryAddressService.getAddressByCEP(cleanCEP)

      setStreet(address.logradouro)
      setNeighborhood(address.bairro)
      setCity(address.localidade)
      setState(address.uf)
      setErrors((prev) => ({ ...prev, cep: undefined }))
    } catch (error) {
      console.error('CEP search error:', error)
      setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }))
    } finally {
      setIsLoadingCEP(false)
    }
  }

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setIsLoading(true)

      // Validações locais
      const newErrors: typeof errors = {}

      if (!cep || !validators.cep(cep)) {
        newErrors.cep = 'CEP inválido'
      }

      if (!number) {
        newErrors.number = 'Número é obrigatório'
      }

      if (!neighborhood) {
        newErrors.neighborhood = 'Bairro é obrigatório'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      console.log('📤 handleSubmit - Criando endereço')

      await deliveryAddressService.create({
        label,
        cep: formatters.cleanCEP(cep),
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        isDefault: true,
        tenant: 'Compranomia',
      })

      console.log('✅ handleSubmit - Endereço criado com sucesso')

      // Atualizar user no context
      if (user) {
        const updatedUser = { ...user, isAddressDataProvided: true }
        updateUser(updatedUser)
      }

      // AuthContext vai redirecionar automaticamente para (tabs)
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

  const addressLabels = [
    AddressType.Casa,
    AddressType.Trabalho,
    AddressType.Outro,
  ]

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
            <Ionicons name="location" size={64} color={colors.primary} />
            <Text style={components.auth.title}>Seu endereço</Text>
            <Text style={components.auth.subtitle}>
              Informe seu endereço para finalizar o cadastro
            </Text>
          </View>

          {/* Form */}
          <View style={components.auth.formContainer}>
            {/* CEP */}
            <View>
              <Text style={components.input.label}>CEP</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[
                    components.input.container,
                    components.input.text,
                    errors.cep && components.input.error,
                  ]}
                  value={cep}
                  onChangeText={(text) => {
                    const formatted = formatters.cep(text)
                    setCep(formatted)
                    setErrors((prev) => ({ ...prev, cep: undefined }))
                    setApiErrors(null)

                    if (formatted.replace(/\D/g, '').length === 8) {
                      handleCEPSearch(formatted)
                    }
                  }}
                  placeholder="00000-000"
                  keyboardType="number-pad"
                  maxLength={9}
                />
                {isLoadingCEP && (
                  <ActivityIndicator
                    style={{ position: 'absolute', right: 16, top: 16 }}
                    color={colors.primary}
                  />
                )}
              </View>
              {errors.cep && (
                <Text style={components.auth.errorText}>{errors.cep}</Text>
              )}
            </View>

            {/* Rua (preenchida automaticamente) */}
            <View>
              <Text style={components.input.label}>Rua</Text>
              <TextInput
                style={[
                  components.input.container,
                  components.input.text,
                  { backgroundColor: colors.disabled },
                ]}
                value={street}
                editable={false}
              />
            </View>

            {/* Número */}
            <View>
              <Text style={components.input.label}>Número</Text>
              <TextInput
                style={[
                  components.input.container,
                  components.input.text,
                  errors.number && components.input.error,
                ]}
                value={number}
                onChangeText={(text) => {
                  setNumber(text)
                  setErrors((prev) => ({ ...prev, number: undefined }))
                  setApiErrors(null)
                }}
                placeholder="123"
                keyboardType="number-pad"
              />
              {errors.number && (
                <Text style={components.auth.errorText}>{errors.number}</Text>
              )}
            </View>

            {/* Complemento */}
            <View>
              <Text style={components.input.label}>Complemento (opcional)</Text>
              <TextInput
                style={[components.input.container, components.input.text]}
                value={complement}
                onChangeText={setComplement}
                placeholder="Apto, bloco, etc"
              />
            </View>

            {/* Bairro (preenchido automaticamente mas editável) */}
            <View>
              <Text style={components.input.label}>Bairro</Text>
              <TextInput
                style={[
                  components.input.container,
                  components.input.text,
                  errors.neighborhood && components.input.error,
                ]}
                value={neighborhood}
                onChangeText={(text) => {
                  setNeighborhood(text)
                  setErrors((prev) => ({ ...prev, neighborhood: undefined }))
                  setApiErrors(null)
                }}
                placeholder="Seu bairro"
              />
              {errors.neighborhood && (
                <Text style={components.auth.errorText}>
                  {errors.neighborhood}
                </Text>
              )}
            </View>

            {/* Labels */}
            <View>
              <Text style={components.input.label}>Este endereço é</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {addressLabels.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      components.auth.buttonSecondary,
                      {
                        flex: 1,
                        minWidth: 100,
                        backgroundColor:
                          label === option ? colors.primary : colors.background,
                        borderColor:
                          label === option ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLabel(option)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        components.auth.buttonTextSecondary,
                        {
                          color:
                            label === option
                              ? colors.textInverse
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Erros da API */}
            <ErrorMessage errors={apiErrors} />

            {/* Botão Continuar */}
            <TouchableOpacity
              style={components.auth.buttonPrimary}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={components.auth.buttonText}>Continuar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
