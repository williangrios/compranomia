// hooks/useAddressSearch.ts
import { useState } from 'react'
import { formatters } from '@/utils/formatters'

interface ViaCEPResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface AddressData {
  street: string
  neighborhood: string
  city: string
  state: string
}

export function useAddressSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function searchByCEP(cep: string): Promise<AddressData | null> {
    const cleanCEP = formatters.cleanCEP(cep)

    if (cleanCEP.length !== 8) {
      setError('CEP inválido')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data: ViaCEPResponse = await response.json()

      if (data.erro) {
        setError('CEP não encontrado')
        return null
      }

      return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }
    } catch (err) {
      console.error('CEP search error:', err)
      setError('Erro ao buscar CEP')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    searchByCEP,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
