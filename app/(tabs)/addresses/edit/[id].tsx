// app/(tabs)/profile/addresses/edit/[id].tsx
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
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Header } from '@/components/ui/Header'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { AddressType, DeliveryAddress } from '@/types'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { validators } from '@/utils/validators'
import { ProfileHeader } from '@/components/ui/ProfileHeader'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  cep?: string
  number?: string
  neighborhood?: string
}

export default function EditAddress() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [address, setAddress] = useState<DeliveryAddress | null>(null)
  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [reference, setReference] = useState('')
  const [label, setLabel] = useState<AddressType>(AddressType.Casa)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadAddress()
  }, [id])

  async function loadAddress() {
    try {
      setIsFetching(true)
      const { deliveryAddress } = await deliveryAddressService.getById(id)
      setAddress(deliveryAddress)

      // Populate form
      setCep(formatters.cep(deliveryAddress.cep))
      setStreet(deliveryAddress.street)
      setNumber(deliveryAddress.number)
      setComplement(deliveryAddress.complement || '')
      setNeighborhood(deliveryAddress.neighborhood)
      setCity(deliveryAddress.city)
      setState(deliveryAddress.state)
      setReference(deliveryAddress.reference || '')
      setLabel(deliveryAddress.label)
    } catch (error: unknown) {
      console.error('Error loading address:', error)
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
      }
    } finally {
      setIsFetching(false)
    }
  }

  async function handleCEPSearch(cepValue: string) {
    const cleanCEP = formatters.cleanCEP(cepValue)

    if (cleanCEP.length !== 8) return

    try {
      setIsLoadingCEP(true)
      const addressData = await deliveryAddressService.getAddressByCEP(cleanCEP)

      setStreet(addressData.logradouro)
      setNeighborhood(addressData.bairro)
      setCity(addressData.localidade)
      setState(addressData.uf)
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

      const newErrors: FormErrors = {}

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

      await deliveryAddressService.update(id, {
        label,
        cep: formatters.cleanCEP(cep),
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        reference,
      })

      router.back()
    } catch (error: unknown) {
      console.error('Error updating address:', error)
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
      } else {
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

  if (isFetching) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ProfileHeader title="Editar Endereço" showBack />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ProfileHeader title="Editar Endereço" showBack />

        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* CEP */}
          <View style={{ marginBottom: 16 }}>
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

          {/* Street */}
          <View style={{ marginBottom: 16 }}>
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

          {/* Number */}
          <View style={{ marginBottom: 16 }}>
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

          {/* Complement */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Complemento (opcional)</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={complement}
              onChangeText={setComplement}
              placeholder="Apto, bloco, etc"
            />
          </View>

          {/* Neighborhood */}
          <View style={{ marginBottom: 16 }}>
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

          {/* Reference */}
          <View style={{ marginBottom: 16 }}>
            <Text style={components.input.label}>Referência (opcional)</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={reference}
              onChangeText={setReference}
              placeholder="Próximo ao mercado..."
              maxLength={200}
            />
          </View>

          {/* Labels */}
          <View style={{ marginBottom: 16 }}>
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
              <Text style={components.auth.buttonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}
