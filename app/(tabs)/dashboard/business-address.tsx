// app/(tabs)/dashboard/business-address.tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { profileService } from '@/services/profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { Screen } from '@/components/layout/Screen'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { useGeocode } from '@/hooks/useGeocode'
import { getApiErrors } from '@/utils/getApiErrors'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  postalCode?: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  country?: string
}

export default function BusinessAddress() {
  const { user, updateUser } = useAuth()
  const { searchByCEP, isLoading: isLoadingCEP } = useAddressSearch()
  const { geocode } = useGeocode()

  const [postalCode, setPostalCode] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Brasil')
  const [isLoading, setIsLoading] = useState(false)

  // ✅ NOVO: Estado para coordenadas
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  console.log('[BusinessAddress] user do AuthContext:', user)
  useEffect(() => {
    if (user) {
      setPostalCode(user.postalCode ? formatters.cep(user.postalCode) : '')
      setStreet(user.street || '')
      setNumber(user.number || '')
      setComplement(user.complement || '')
      setNeighborhood(user.neighborhood || '')
      setCity(user.city || '')
      setState(user.state || '')
      setCountry(user.country || 'Brasil')

      // ✅ NOVO: Carrega coordenadas existentes
      if (user.location?.coordinates) {
        setCoordinates(user.location.coordinates as [number, number])
      }
    }
  }, [user])

  // ✅ NOVO: Geocodifica após buscar CEP
  async function handleCEPSearch(cepValue: string) {
    const result = await searchByCEP(cepValue)

    if (result) {
      setStreet(result.street)
      setNeighborhood(result.neighborhood)
      setCity(result.city)
      setState(result.state)
      setErrors((prev) => ({ ...prev, postalCode: undefined }))

      // ✅ Tenta geocodificar em background (silencioso)
      tryGeocode(
        formatters.cleanCEP(cepValue),
        result.street,
        number || '0',
        result.city,
        result.state,
      )
    } else {
      setCity('')
      setState('')
      setCoordinates(null)
      setErrors((prev) => ({ ...prev, postalCode: 'CEP não encontrado' }))
    }
  }

  // ✅ NOVO: Tenta geocodificar (silencioso)
  async function tryGeocode(
    cepValue: string,
    streetValue: string,
    numberValue: string,
    cityValue: string,
    stateValue: string,
  ) {
    const coords = await geocode({
      cep: cepValue,
      street: streetValue,
      number: numberValue,
      city: cityValue,
      state: stateValue,
    })

    if (coords) {
      setCoordinates([coords.lng, coords.lat])
      console.log('✅ Coordenadas encontradas:', coords)
    } else {
      console.log('❌ Coordenadas não encontradas')
    }
  }

  // ✅ NOVO: Tenta geocodificar novamente quando número é preenchido
  useEffect(() => {
    if (postalCode && street && number && city && state && !coordinates) {
      tryGeocode(formatters.cleanCEP(postalCode), street, number, city, state)
    }
  }, [number])

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setSuccess(null)

      const newErrors: FormErrors = {}

      if (!postalCode.trim()) {
        newErrors.postalCode = 'CEP é obrigatório'
      }

      if (!street.trim()) {
        newErrors.street = 'Rua é obrigatória'
      }

      if (!number.trim()) {
        newErrors.number = 'Número é obrigatório'
      }

      if (!neighborhood.trim()) {
        newErrors.neighborhood = 'Bairro é obrigatório'
      }

      if (!city.trim()) {
        newErrors.city = 'Cidade é obrigatória'
      }

      if (!state.trim()) {
        newErrors.state = 'Estado é obrigatório'
      }

      if (!country.trim()) {
        newErrors.country = 'País é obrigatório'
      }

      if (!coordinates) newErrors.postalCode = 'CEP não encontrado'
      if (errors.postalCode) {
        return
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // ✅ NOVO: Se não tem coordenadas, abre modal
      if (!coordinates) {
        setShowLocationPicker(true)
        return
      }

      // Prossegue com salvamento
      await saveAddress()
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    }
  }

  // ✅ NOVO: Função separada para salvar
  async function saveAddress() {
    try {
      setIsLoading(true)

      const response = await profileService.updateAddress({
        postalCode: formatters.cleanCEP(postalCode),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        // ✅ NOVO: Adiciona coordenadas
        ...(coordinates && {
          location: { coordinates },
        }),
      })

      updateUser(response.user)

      setSuccess({
        message: 'Endereço atualizado com sucesso',
      })
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Screen>
      <View
        style={{
          backgroundColor: colors.primary + '10',
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
          📍 Informe o endereço da sua loja para que os clientes possam
          encontrar você facilmente.
        </Text>
      </View>

      {/* CEP */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>CEP *</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[
              components.input.container,
              components.input.text,
              errors.postalCode && components.input.error,
            ]}
            value={postalCode}
            onChangeText={(text) => {
              const formatted = formatters.cep(text)
              setPostalCode(formatted)
              setErrors((prev) => ({ ...prev, postalCode: undefined }))
              setApiErrors(null)
              setSuccess(null)

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
        {errors.postalCode && (
          <Text style={components.auth.errorText}>{errors.postalCode}</Text>
        )}
      </View>

      {/* Rua */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Rua *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.street && components.input.error,
          ]}
          value={street}
          onChangeText={(text) => {
            setStreet(text)
            setErrors((prev) => ({ ...prev, street: undefined }))
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="Nome da rua"
          autoCapitalize="words"
        />
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
        >
          Preenchido automaticamente, mas você pode editar
        </Text>
        {errors.street && (
          <Text style={components.auth.errorText}>{errors.street}</Text>
        )}
      </View>

      {/* Número */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Número *</Text>
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
            setSuccess(null)
          }}
          placeholder="Número"
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
          onChangeText={(text) => {
            setComplement(text)
            setApiErrors(null)
            setSuccess(null)
          }}
          placeholder="Apto, bloco, etc."
          autoCapitalize="words"
        />
      </View>

      {/* Bairro */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Bairro *</Text>
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
            setSuccess(null)
          }}
          placeholder="Bairro"
          autoCapitalize="words"
        />
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
        >
          Preenchido automaticamente, mas você pode editar
        </Text>
        {errors.neighborhood && (
          <Text style={components.auth.errorText}>{errors.neighborhood}</Text>
        )}
      </View>

      {/* Cidade */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Cidade *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.city && components.input.error,
            { backgroundColor: colors.disabled },
          ]}
          value={city}
          editable={false}
        />
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
        >
          Preenchido automaticamente pelo CEP
        </Text>
        {errors.city && (
          <Text style={components.auth.errorText}>{errors.city}</Text>
        )}
      </View>

      {/* Estado */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Estado *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.state && components.input.error,
            { backgroundColor: colors.disabled },
          ]}
          value={state}
          editable={false}
        />
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
        >
          Preenchido automaticamente pelo CEP
        </Text>
        {errors.state && (
          <Text style={components.auth.errorText}>{errors.state}</Text>
        )}
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
          <Text style={components.auth.buttonText}>Salvar Endereço</Text>
        )}
      </TouchableOpacity>
    </Screen>
  )
}
