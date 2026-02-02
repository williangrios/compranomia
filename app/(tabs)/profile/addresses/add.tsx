// app/(tabs)/profile/addresses/add.tsx
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { AddressType } from '@/types'
import { colors, components } from '@/theme'
import { formatters } from '@/utils/formatters'
import { validators } from '@/utils/validators'
import { Screen } from '@/components/layout/Screen'
import { Tenant } from '@wrcb/cb-common'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  cep?: string
  number?: string
  neighborhood?: string
}

export default function AddAddress() {
  const router = useRouter()

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
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

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
      setSuccess(null)
      setIsLoading(true)

      const newErrors: FormErrors = {}

      if (!validators.cep(cep)) newErrors.cep = 'CEP inválido'
      if (!number) newErrors.number = 'Número é obrigatório'
      if (!neighborhood) newErrors.neighborhood = 'Bairro é obrigatório'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      await deliveryAddressService.create({
        label,
        cep: formatters.cleanCEP(cep),
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        reference,
        isDefault: false,
        tenant: Tenant.Compranomia,
      })

      setSuccess({ message: 'Endereço cadastrado com sucesso' })
    } catch (error: any) {
      setApiErrors(error.errors || [{ message: 'Erro ao cadastrar endereço' }])
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
            setSuccess(null)
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
          placeholder="Apto, bloco, etc"
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
            setSuccess(null)
          }}
          placeholder="Seu bairro"
        />
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

      <SuccessMessage success={success} />
      <ErrorMessage errors={apiErrors} />

      <TouchableOpacity
        style={components.auth.buttonPrimary}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.85}
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
