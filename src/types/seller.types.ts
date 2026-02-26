// src/types/seller.types.ts

import { MeasurementUnit, UserCategory, UserTags } from '@wrcb/cb-common'

export interface NearbySeller {
  id: string
  nickName: string
  name: string
  profilePhoto: string
  category: UserCategory
  distanceKm: number
  deliveryFee: number
  freeAbove: number
  averageDeliveryTime: number
  tags: UserTags[]
}

export interface SellerProductResult {
  id: string
  sellerId: {
    id: string
    nickName: string
    profilePhoto: string
    category: UserCategory
  }
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
  sellerSpotlighted?: boolean
  adminSpotlighted?: boolean
  isProhibitedForMinors?: boolean
  isPrescriptionRequired?: boolean
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
