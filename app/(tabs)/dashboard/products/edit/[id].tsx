import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { AddressType } from '@/types'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { validators } from '@/utils/validators'
import { Screen } from '@/components/layout/Screen'

interface ApiError {
  message: string
}

interface FormErrors {
  cep?: string
  number?: string
  neighborhood?: string
}

export default function EditAddress() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [reference, setReference] = useState('')
  const [label, setLabel] = useState<AddressType>(AddressType.Casa)

  const [isFetching, setIsFetching] = useState(true)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadAddress()
  }, [id])

  async function loadAddress() {
    try {
      const { deliveryAddress } = await deliveryAddressService.getById(id)

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
      if (error instanceof Error) {
        setApiErrors([{ message: error.message }])
      }
    } finally {
      setIsFetching(false)
    }
  }

  async function handleCEPSearch(value: string) {
    const cleanCEP = formatters.cleanCEP(value)
    if (cleanCEP.length !== 8) return

    try {
      setIsLoadingCEP(true)
      const address = await deliveryAddressService.getAddressByCEP(cleanCEP)

      setStreet(address.logradouro)
      setNeighborhood(address.bairro)
      setCity(address.localidade)
      setState(address.uf)
      setErrors((prev) => ({ ...prev, cep: undefined }))
    } catch {
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

      if (!validators.cep(cep)) newErrors.cep = 'CEP inválido'
      if (!number) newErrors.number = 'Número é obrigatório'
      if (!neighborhood) newErrors.neighborhood = 'Bairro é obrigatório'

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
      setApiErrors([{ message: 'Erro ao atualizar endereço' }])
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
      <Screen scroll={false}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 80 }}
        />
      </Screen>
    )
  }

  return (
    <Screen>
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

      {/* Rua */}
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

      {/* Número */}
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

      {/* Complemento */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Complemento (opcional)</Text>
        <TextInput
          style={[components.input.container, components.input.text]}
          value={complement}
          onChangeText={setComplement}
        />
      </View>

      {/* Bairro */}
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
        />
        {errors.neighborhood && (
          <Text style={components.auth.errorText}>{errors.neighborhood}</Text>
        )}
      </View>

      {/* Tipo */}
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

      <TouchableOpacity
        style={components.auth.buttonPrimary}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={components.auth.buttonText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </Screen>
  )
}
