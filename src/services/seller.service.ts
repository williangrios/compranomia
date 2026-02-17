// src/services/seller.service.ts

import {
  NearbySeller,
  PaginatedProductsResponse,
  SellerProductResult,
  SellerProductsResponse,
} from '@/types/seller.types'
import api from './api'
import { PaymentMethod } from '@wrcb/cb-common'

export const sellerService = {
  async getNearby(
    lat: number,
    lng: number,
  ): Promise<{ sellers: NearbySeller[] }> {
    const response = await api.get('/api/business/compranomia/sellers/nearby', {
      params: { lat, lng },
    })
    return response.data.data
  },

  async getHomeFeed(
    lat: number,
    lng: number,
    params?: {
      category?: string
      limit?: number
    },
  ): Promise<{
    sellers: NearbySeller[]
    sellersTotal: number
    promotions: SellerProductResult[]
    promotionsTotal: number
    sponsored: SellerProductResult[]
    sponsoredTotal: number
  }> {
    const response = await api.get('/api/business/compranomia/home-feed', {
      params: { lat, lng, ...params },
    })
    return response.data.data
  },

  async getProducts(
    sellerId: string,
    params?: {
      productCategory?: string
      limit?: number
      skip?: number
      q?: string
    },
  ): Promise<SellerProductsResponse> {
    const response = await api.get(
      `/api/business/compranomia/sellers/${sellerId}/products`,
      { params },
    )
    return response.data.data
  },

  async searchSellerProducts(
    sellerId: string,
    query: string,
    params?: {
      limit?: number
      skip?: number
    },
  ): Promise<SellerProductsResponse> {
    const response = await api.get(
      `/api/business/compranomia/sellers/${sellerId}/products/search`,
      { params: { q: query, ...params } },
    )
    return response.data.data
  },

  async getSponsored(
    lat: number,
    lng: number,
    params?: {
      category?: string
      limit?: number
      skip?: number
    },
  ): Promise<PaginatedProductsResponse> {
    const response = await api.get(
      '/api/business/compranomia/products/sponsored',
      { params: { lat, lng, ...params } },
    )
    return response.data.data
  },

  async getNearbySellers(
    lat: number,
    lng: number,
    params?: {
      category?: string
      limit?: number
      skip?: number
    },
  ): Promise<{ sellers: NearbySeller[]; total: number }> {
    const response = await api.get('/api/business/compranomia/sellers/nearby', {
      params: { lat, lng, ...params },
    })
    return response.data.data
  },

  async getPromotions(
    lat: number,
    lng: number,
    params?: {
      minDiscount?: number
      category?: string
      limit?: number
      skip?: number
    },
  ): Promise<PaginatedProductsResponse> {
    const response = await api.get(
      '/api/business/compranomia/products/promotions',
      { params: { lat, lng, ...params } },
    )
    return response.data.data
  },

  async getSellerProfile(sellerId: string): Promise<{
    seller: {
      id: string
      nickName: string
      name: string
      bio: string
      profilePhoto: string
      category: string
      averageRating: number
      ratingCount: number
      address: {
        neighborhood: string
        city: string
        state: string
      }
    }
    delivery: {
      ranges: {
        minKm: number
        maxKm: number
        fee: number
        freeAbove: number
        averageDeliveryTime: number
      }[]
    }
    schedule: {
      preparationTime: number
      days: {
        dayOfWeek: number
        isOpen: boolean
        periods: { openTime: string; closeTime: string }[]
        cutoffTime?: string | null
      }[]
      exceptions: any[]
    }
    acceptedPaymentMethods: PaymentMethod[]
    isActive: boolean
  }> {
    const response = await api.get(
      `/api/business/compranomia/sellers/${sellerId}/profile`,
    )
    return response.data.data
  },

  async searchProducts(
    query: string,
    lat: number,
    lng: number,
    params?: {
      limit?: number
      skip?: number
    },
  ): Promise<PaginatedProductsResponse> {
    console.log('[SEARCH][SERVICE][REQUEST]', {
      query,
      lat,
      lng,
      params,
    })
    const response = await api.get(
      '/api/business/compranomia/products/search',
      { params: { q: query, lat, lng, ...params } },
    )

    console.log('[SEARCH][SERVICE][RAW RESPONSE]', response.data)
    return response.data.data
  },
}
