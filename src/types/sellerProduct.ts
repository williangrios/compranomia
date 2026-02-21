import { MeasurementUnit } from '@wrcb/cb-common'

export interface SellerProduct {
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
  minStockAlert?: number
  isActive: boolean
  isPrescriptionRequired: boolean
  isProhibitedForMinors: boolean
  sellerSpotlighted: boolean
  adminSpotlighted: boolean
  originalImages?: string[]
  processedImages?: string[]
  discountPercent?: number
  productCatalog?: {
    id: string
    name: string
    description: string
    productCategory: string
    measurementUnit?: string
    baseWeight?: number
    step?: number
    brand?: string
    isPrescriptionRequired: boolean
    isProhibitedForMinors: boolean
    sellerSpotlighted: boolean
    adminSpotlighted: boolean
    barcode?: string
    originalImages?: string[]
    processedImages?: string[]
  }
  seller?: {
    id: string
    nickName: string
    name: string
    profilePhoto: string
  }
}
