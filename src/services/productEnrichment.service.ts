import { API_URL } from '@/utils/constants'
import { storageService } from './storage.service'

export const productEnrichmentService = {
  async enrich(image: { uri: string }) {
    const formData = new FormData()

    formData.append('image', {
      uri: image.uri,
      name: 'product.jpg',
      type: 'image/jpeg',
    } as any)

    const token = await storageService.getAuthToken()

    console.log('[ENRICH] fetch upload start')

    const response = await fetch(
      `${API_URL}/api/business/compranomia/catalog/enrich-from-image`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // 🚨 NÃO DEFINIR Content-Type
        },
        body: formData,
      },
    )

    if (!response.ok) {
      let data: any = null

      try {
        data = await response.json()
      } catch {
        throw new Error('ConnectionError')
      }

      // 🔥 NORMALIZAÇÃO AQUI
      if (!data?.errors && data?.message) {
        data = {
          errors: [
            {
              message: data.message,
            },
          ],
        }
      }

      const error: any = new Error('ApiError')
      error.response = {
        data,
      }

      throw error
    }

    const json = await response.json()
    return json.data
  },
}
