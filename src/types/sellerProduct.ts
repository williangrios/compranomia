export interface SellerProduct {
  id: string
  sellerId: string
  productCatalogId: string
  name: string
  description: string
  productCategory: string
  measurementUnit: string
  baseWeight?: number
  brand?: string
  barcode?: string
  step?: number
  price: number
  promotionalPrice?: number | null
  stock: number
  minStockAlert?: number
  isActive: boolean
  originalImages?: string[]
  processedImages?: string[]
  productCatalog?: {
    id: string
    name: string
    description: string
    productCategory: string
    measurementUnit?: string
    baseWeight?: number
    step?: number
    brand?: string
    barcode?: string
    originalImages?: string[]
    processedImages?: string[]
  }
}
