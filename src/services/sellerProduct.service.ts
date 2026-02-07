import { API_URL } from '@/utils/constants'
import api from './api'
import { storageService } from './storage.service'

interface CreatePayload {
  name: string
  description?: string
  brand?: string
  productCategory?: string
  measurementUnit?: string
  baseWeight?: number
  step?: number
  barcode?: string
  price: number
  stock: number
  minStockAlert?: number
  promotionalPrice?: number
  images?: { uri: string }[]
}

interface AdoptPayload {
  productCatalogId?: string
  barcode?: string
  price: number
  stock: number
  step?: number
  minStockAlert?: number
  promotionalPrice?: number | null
}

interface UpdatePayload {
  price?: number
  stock?: number
  step?: number
  minStockAlert?: number
  promotionalPrice?: number | null
  name?: string
  description?: string
  brand?: string
  baseWeight?: number
}

export const sellerProductService = {
  async list() {
    const { data } = await api.get('/api/business/compranomia/seller-product')
    return data
  },

  async getById(id: string) {
    const { data } = await api.get(
      `/api/business/compranomia/seller-product-by-id/${id}`,
    )
    return data
  },

  async create(
    payload: CreatePayload & {
      barcode?: string
      promotionalPrice?: number
    },
  ) {
    const formData = new FormData()

    formData.append('name', payload.name)
    formData.append('price', String(payload.price))
    formData.append('stock', String(payload.stock))

    if (payload.description) formData.append('description', payload.description)
    if (payload.brand) formData.append('brand', payload.brand)
    if (payload.productCategory)
      formData.append('productCategory', payload.productCategory)
    if (payload.measurementUnit)
      formData.append('measurementUnit', payload.measurementUnit)
    if (typeof payload.baseWeight === 'number')
      formData.append('baseWeight', String(payload.baseWeight))
    if (typeof payload.step === 'number')
      formData.append('step', String(payload.step))
    if (typeof payload.minStockAlert === 'number')
      formData.append('minStockAlert', String(payload.minStockAlert))
    if (typeof payload.promotionalPrice === 'number')
      formData.append('promotionalPrice', String(payload.promotionalPrice))
    if (payload.barcode) formData.append('barcode', payload.barcode)

    if (payload.images?.length) {
      payload.images.forEach((img, index) => {
        formData.append('originalImages', {
          uri: img.uri,
          name: `product-${index}.jpg`,
          type: 'image/jpeg',
        } as any)
      })
    }

    const token = await storageService.getAuthToken()

    const response = await fetch(
      `${API_URL}/api/business/compranomia/catalog/new`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      console.log('[CREATE] error response:', error)
      throw { response: { data: error } }
    }

    const data = await response.json()
    return data
  },

  // async create(
  //   payload: CreatePayload & {
  //     barcode?: string
  //     promotionalPrice?: number
  //   },
  // ) {
  //   console.log('inicou create product')
  //   const formData = new FormData()

  //   formData.append('name', payload.name)
  //   formData.append('price', String(payload.price))
  //   formData.append('stock', String(payload.stock))

  //   if (payload.description) formData.append('description', payload.description)
  //   if (payload.brand) formData.append('brand', payload.brand)
  //   if (payload.productCategory)
  //     formData.append('productCategory', payload.productCategory)
  //   if (payload.measurementUnit)
  //     formData.append('measurementUnit', payload.measurementUnit)
  //   if (typeof payload.baseWeight === 'number')
  //     formData.append('baseWeight', String(payload.baseWeight))
  //   if (typeof payload.step === 'number')
  //     formData.append('step', String(payload.step))
  //   if (typeof payload.minStockAlert === 'number')
  //     formData.append('minStockAlert', String(payload.minStockAlert))
  //   if (typeof payload.promotionalPrice === 'number')
  //     formData.append('promotionalPrice', String(payload.promotionalPrice))
  //   if (payload.barcode) formData.append('barcode', payload.barcode)

  //   if (payload.images?.length) {
  //     payload.images.forEach((img, index) => {
  //       formData.append('originalImages', {
  //         uri: img.uri,
  //         name: `product-${index}.jpg`,
  //         type: 'image/jpeg',
  //       } as any)
  //     })
  //   }

  //   console.log('[CREATE] API_URL:', api.defaults.baseURL)
  //   const { data } = await api.post(
  //     '/api/business/compranomia/catalog/new',
  //     formData,
  //     { timeout: 60000 },
  //   )
  //   console.log('retorno create product--------', data)
  //   return data
  // },

  async adopt(payload: AdoptPayload) {
    console.log('inicou adopt product')
    const { data } = await api.post(
      '/api/business/compranomia/catalog/adopt',
      payload,
    )
    console.log('retorno adopt product--------', data)
    return data
  },

  async update(id: string, payload: UpdatePayload) {
    console.log('inicou update product')
    const { data } = await api.patch(
      `/api/business/compranomia/seller-product/${id}`,
      payload,
    )
    console.log('retorno update product--------', data)
    return data
  },

  async getCatalogById(id: string) {
    const { data } = await api.get(
      `/api/business/compranomia/product-catalog-by-id/${id}`,
    )
    console.log('retorno get product by id--------', data)
    return data
  },

  async searchCatalog(query: string) {
    const { data } = await api.get('/api/business/compranomia/catalog/search', {
      params: { query },
    })
    return data
  },

  async delete(id: string) {
    const { data } = await api.delete(
      `/api/business/compranomia/seller-product/${id}`,
    )
    return data
  },
}
