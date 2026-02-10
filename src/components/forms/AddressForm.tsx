// components/forms/AddressForm.tsx
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
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { AddressType } from '@/types'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { validators } from '@/utils/validators'
import { Tenant } from '@wrcb/cb-common'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { useGeocode } from '@/hooks/useGeocode'
import { getApiErrors } from '@/utils/getApiErrors'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  cep?: string
  street?: string
  number?: string
  neighborhood?: string
}

interface AddressFormProps {
  addressId?: string
  isDefault?: boolean
  onSuccess?: () => void
  submitButtonText?: string
}

export function AddressForm({
  addressId,
  isDefault = false,
  onSuccess,
  submitButtonText,
}: AddressFormProps) {
  const isEditMode = !!addressId

  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Brasil')
  const [reference, setReference] = useState('')
  const [label, setLabel] = useState<AddressType>(AddressType.Casa)

  // ✅ NOVO: Estado para coordenadas
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const { searchByCEP, isLoading: isLoadingCEP } = useAddressSearch()
  const { geocode } = useGeocode()

  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isEditMode && addressId) {
      loadAddress()
    }
  }, [addressId])

  async function loadAddress() {
    if (!addressId) return

    try {
      setIsFetching(true)
      const { deliveryAddress } =
        await deliveryAddressService.getById(addressId)

      setCep(formatters.cep(deliveryAddress.cep))
      setStreet(deliveryAddress.street)
      setNumber(deliveryAddress.number)
      setComplement(deliveryAddress.complement || '')
      setNeighborhood(deliveryAddress.neighborhood)
      setCity(deliveryAddress.city)
      setState(deliveryAddress.state)
      setReference(deliveryAddress.reference || '')
      setLabel(deliveryAddress.label)

      // ✅ NOVO: Carrega coordenadas se existirem
      // Nota: DeliveryAddress não tem location no schema atual
      // Se adicionar no futuro, descomentar:
      // if (deliveryAddress.location?.coordinates) {
      //   setCoordinates(deliveryAddress.location.coordinates as [number, number])
      // }
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsFetching(false)
    }
  }

  // ✅ NOVO: Geocodifica após buscar CEP
  async function handleCEPSearch(value: string) {
    const result = await searchByCEP(value)

    if (result) {
      setStreet(result.street)
      setNeighborhood(result.neighborhood)
      setCity(result.city)
      setState(result.state)
      setErrors((prev) => ({ ...prev, cep: undefined }))

      // ✅ Tenta geocodificar em background (silencioso)
      tryGeocode(
        formatters.cleanCEP(value),
        result.street,
        '', // número ainda não foi preenchido
        result.city,
        result.state,
      )
    } else {
      setCity('')
      setState('')
      setCoordinates(null)
      setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }))
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
      number: numberValue || '0',
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
    if (cep && street && number && city && state && !coordinates) {
      tryGeocode(formatters.cleanCEP(cep), street, number, city, state)
    }
  }, [number]) // Roda quando número muda

  async function handleSubmit() {
    try {
      setErrors({})
      setApiErrors(null)
      setSuccess(null)

      // Validações
      const newErrors: FormErrors = {}
      if (!validators.cep(cep)) newErrors.cep = 'CEP inválido'
      if (!street) newErrors.street = 'Rua é obrigatória'
      if (!number) newErrors.number = 'Número é obrigatório'
      if (!neighborhood) newErrors.neighborhood = 'Bairro é obrigatório'
      if (!coordinates) newErrors.cep = 'CEP não encontrado'
      if (errors.cep) {
        return
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // ✅ NOVO: Se não tem coordenadas, abre modal

      // Prossegue com salvamento
      await saveAddress()
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    }
  }

  // ✅ NOVO: Função separada para salvar (reutilizada após modal)
  async function saveAddress() {
    try {
      setIsLoading(true)

      const addressData = {
        label,
        cep: formatters.cleanCEP(cep),
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        reference,
        // ✅ NOVO: Adiciona coordenadas
        ...(coordinates && {
          location: { coordinates },
        }),
      }

      if (isEditMode && addressId) {
        await deliveryAddressService.update(addressId, addressData)
        setSuccess({ message: 'Endereço atualizado com sucesso' })
      } else {
        await deliveryAddressService.create({
          ...addressData,
          isDefault,
          tenant: Tenant.Compranomia,
        })
        setSuccess({ message: 'Endereço cadastrado com sucesso' })
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ NOVO: Callback do modal
  function handleLocationConfirm(
    coords: [number, number],
    address?: { city: string; state: string },
  ) {
    setCoordinates(coords)

    // ✅ NOVO: Atualiza cidade e estado se vier do reverse geocoding
    if (address) {
      setCity(address.city)
      setState(address.state)
      console.log('✅ Cidade/Estado atualizados:', address)
    }

    setShowLocationPicker(false)

    // Salva automaticamente após confirmar localização
    setTimeout(() => {
      saveAddress()
    }, 100)
  }

  const addressLabels = [
    AddressType.Casa,
    AddressType.Trabalho,
    AddressType.Outro,
  ]

  if (isFetching) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <>
      {/* CEP */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>CEP *</Text>
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
        {errors.cep && (
          <Text style={components.auth.errorText}>{errors.cep}</Text>
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
          editable={true}
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
          onChangeText={setComplement}
          placeholder="Apto, bloco, etc"
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
          placeholder="Seu bairro"
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

      {/* Referência */}
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
              activeOpacity={0.85}
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

      {/* Cidade */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Cidade *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
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
      </View>

      {/* Estado */}
      <View style={{ marginBottom: 16 }}>
        <Text style={components.input.label}>Estado *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
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
      </View>

      <SuccessMessage success={success} />
      <ErrorMessage errors={apiErrors} />

      {/* Botão Submit */}
      <TouchableOpacity
        style={components.auth.buttonPrimary}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={components.auth.buttonText}>
            {submitButtonText ||
              (isEditMode ? 'Salvar Alterações' : 'Salvar Endereço')}
          </Text>
        )}
      </TouchableOpacity>
    </>
  )
}
