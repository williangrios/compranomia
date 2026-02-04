// hooks/useGeocode.ts
import { useState } from 'react'

interface GeocodeParams {
  cep: string
  street: string
  number: string
  city: string
  state: string
}

interface Coordinates {
  lng: number
  lat: number
}

export function useGeocode() {
  const [isLoading, setIsLoading] = useState(false)

  async function geocode(params: GeocodeParams): Promise<Coordinates | null> {
    try {
      setIsLoading(true)

      // 1. Tenta com endereço completo
      const fullAddress = `${params.street}, ${params.number}, ${params.city}, ${params.state}, Brasil`

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(fullAddress)}` +
          `&format=json` +
          `&limit=1` +
          `&countrycodes=br`,
        {
          headers: {
            'User-Agent': 'Compranomia-App/1.0',
          },
        },
      )

      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lng: parseFloat(data[0].lon),
          lat: parseFloat(data[0].lat),
        }
      }

      // 2. Fallback: tenta só com cidade + estado
      const cityFallback = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `city=${encodeURIComponent(params.city)}` +
          `&state=${encodeURIComponent(params.state)}` +
          `&country=brazil` +
          `&format=json` +
          `&limit=1`,
        {
          headers: {
            'User-Agent': 'Compranomia-App/1.0',
          },
        },
      )

      const cityData = await cityFallback.json()

      if (cityData && cityData.length > 0) {
        console.warn(
          '[Geocode] Usando coordenadas aproximadas da cidade:',
          params.city,
        )
        return {
          lng: parseFloat(cityData[0].lon),
          lat: parseFloat(cityData[0].lat),
        }
      }

      // Não encontrou
      return null
    } catch (error) {
      console.error('[Geocode] Erro:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    geocode,
    isLoading,
  }
}
