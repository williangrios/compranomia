// src/types/seller.types.ts

import { MeasurementUnit, UserTags } from '@wrcb/cb-common'

export interface NearbySeller {
  id: string
  nickName: string
  name: string
  profilePhoto: string
  distanceKm: number
  deliveryFee: number
  freeAbove: number
  averageDeliveryTime: number
  tags: UserTags[]
}

export interface SellerProductResult {
  id: string
  sellerId: string
  productCatalogId: string
  name: string
  description: string
  productCategory: string
  measurementUnit: MeasurementUnit
  baseWeight?: number
  brand?: string
  barcode?: string
  step: number
  price: number
  promotionalPrice?: number | null
  stock: number
  minStockAlert: number
  isActive: boolean
  originalImages: string[]
  processedImages: string[]
  discountPercent: number
  seller?: {
    id: string
    nickName: string
    name: string
    profilePhoto: string
  }
}

export interface SellerProductsResponse {
  products: SellerProductResult[]
  seller: {
    id: string
    nickName: string
    name: string
    profilePhoto: string
  }
  total: number
  limit: number
  skip: number
}

export interface PaginatedProductsResponse {
  products: SellerProductResult[]
  total: number
  limit: number
  skip: number
}
