import { MeasurementUnit, UserTags } from '@wrcb/cb-common'
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
  sellerSpotlighted: boolean
  isProhibitedForMinors: boolean
  isPrescriptionRequired: boolean
  images?: { uri: string }[]
}

interface AdoptPayload {
  productCatalogId?: string
  name: string
  description: string
  brand: string
  baseWeight: number
  measurementUnit: MeasurementUnit
  productCategory: UserTags
  barcode?: string
  price: number
  stock: number
  step?: number
  sellerSpotlighted: boolean
  isProhibitedForMinors: boolean
  isPrescriptionRequired: boolean
  minStockAlert?: number
  promotionalPrice?: number | null
}

interface UpdatePayload {
  name: string
  description: string
  brand: string
  baseWeight: number
  measurementUnit: MeasurementUnit
  productCategory: UserTags
  barcode?: string
  price?: number
  stock?: number
  step?: number
  minStockAlert?: number
  sellerSpotlighted: boolean
  isProhibitedForMinors: boolean
  isPrescriptionRequired: boolean
  promotionalPrice?: number | null
  isActive?: boolean
}

export const sellerProductService = {
  async list(includeInactive = true) {
    const { data } = await api.get('/api/business/compranomia/seller-product', {
      params: {
        includeInactive: includeInactive ? 'true' : 'false',
      },
    })
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
    if (typeof payload.sellerSpotlighted === 'boolean')
      formData.append('sellerSpotlighted', String(payload.sellerSpotlighted))
    if (typeof payload.isProhibitedForMinors === 'boolean')
      formData.append(
        'isProhibitedForMinors',
        String(payload.isProhibitedForMinors),
      )
    if (typeof payload.isPrescriptionRequired === 'boolean')
      formData.append(
        'isPrescriptionRequired',
        String(payload.isPrescriptionRequired),
      )

    if (payload.images?.length) {
      payload.images.forEach((img, index) => {
        formData.append('originalImages', {
          uri: img.uri,
          name: `product-${index}.jpg`,
          type: 'image/jpeg',
        } as any)
      })
    }

    const response = await api.post(
      '/api/business/compranomia/catalog/new',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data
  },

  async adopt(payload: AdoptPayload) {
    const { data } = await api.post(
      '/api/business/compranomia/catalog/adopt',
      payload,
    )
    return data
  },

  async update(id: string, payload: UpdatePayload) {
    const { data } = await api.patch(
      `/api/business/compranomia/seller-product/${id}`,
      payload,
    )
    return data
  },

  async getCatalogById(id: string) {
    const { data } = await api.get(
      `/api/business/compranomia/product-catalog-by-id/${id}`,
    )
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
