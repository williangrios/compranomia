import { API_URL, APP_VERSION } from '@/utils/constants'
import { storageService } from './storage.service'
import { Tenant } from '@wrcb/cb-common'

export const productEnrichmentService = {
  async enrich(image: { uri: string }) {
    const formData = new FormData()
    formData.append('image', {
      uri: image.uri,
      name: 'product.jpg',
      type: 'image/jpeg',
    } as any)

    let token: string | null = null
    try {
      token = await storageService.getAuthToken()
    } catch (tokenErr) {
      console.error(
        '[productEnrichmentService.enrich] ERRO ao obter token:',
        tokenErr,
      )
    }

    const url = `${API_URL}/api/business/compranomia/catalog/enrich-from-image`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-tenant': Tenant.Compranomia, // ← adicionar
          'x-app-version': APP_VERSION, // ← adicionar
        },
        body: formData,
      })
    } catch (fetchErr) {
      console.error(
        '[productEnrichmentService.enrich] ERRO no fetch (sem resposta/rede):',
        fetchErr,
      )
      throw fetchErr
    }

    if (!response.ok) {
      console.warn(
        '[productEnrichmentService.enrich] resposta não-ok, lendo body...',
      )
      let data: any = null
      try {
        data = await response.json()
      } catch (parseErr) {
        console.error(
          '[productEnrichmentService.enrich] ERRO ao parsear body de erro:',
          parseErr,
        )
        throw new Error('ConnectionError')
      }

      if (!data?.errors && data?.message) {
        data = { errors: [{ message: data.message }] }
      }

      const error: any = new Error('ApiError')
      error.response = { data }
      console.error(
        '[productEnrichmentService.enrich] lançando ApiError:',
        JSON.stringify(data),
      )
      throw error
    }

    let json: any
    try {
      json = await response.json()
    } catch (parseErr) {
      console.error(
        '[productEnrichmentService.enrich] ERRO ao parsear resposta ok:',
        parseErr,
      )
      throw parseErr
    }
    return json.data
  },
}
