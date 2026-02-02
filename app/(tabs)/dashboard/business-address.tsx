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
import { formatApiError } from '@/utils/errorHandler'

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

  const [postalCode, setPostalCode] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Brasil')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)

  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

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
    }
  }, [user])

  // Buscar endereço por CEP
  async function handleCEPSearch(cepValue: string) {
    const cleanCEP = formatters.cleanCEP(cepValue)

    if (cleanCEP.length !== 8) return

    try {
      setIsLoadingCEP(true)

      // Buscar via ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (data.erro) {
        setErrors((prev) => ({ ...prev, postalCode: 'CEP não encontrado' }))
        return
      }

      setStreet(data.logradouro || '')
      setNeighborhood(data.bairro || '')
      setCity(data.localidade || '')
      setState(data.uf || '')
      setErrors((prev) => ({ ...prev, postalCode: undefined }))
    } catch (error) {
      console.error('CEP search error:', error)
      setErrors((prev) => ({ ...prev, postalCode: 'Erro ao buscar CEP' }))
    } finally {
      setIsLoadingCEP(false)
    }
  }

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setSuccess(null)
      setIsLoading(true)

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

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const response = await profileService.updateAddress({
        postalCode: formatters.cleanCEP(postalCode),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
      })

      updateUser(response.user)

      setSuccess({
        message: 'Endereço atualizado com sucesso',
      })
    } catch (error: any) {
      console.error('❌ BusinessAddress error:', error)

      const formatted = formatApiError(error)
      setApiErrors(formatted.errors)
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

              // Buscar automaticamente quando completar 8 dígitos
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
            { backgroundColor: colors.backgroundSecondary },
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
            { backgroundColor: colors.backgroundSecondary },
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

      {/* País */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>País *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.country && components.input.error,
            { backgroundColor: colors.backgroundSecondary },
          ]}
          value={country}
          editable={false}
        />
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
        >
          O país não pode ser alterado
        </Text>
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
