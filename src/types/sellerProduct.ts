export interface SellerProduct {
  id: string
  sellerId: string
  price: number
  stock: number
  isActive: boolean

  productCatalog?: {
    id: string
    name: string
    description: string
    category: string
    brand?: string
    measurementUnit?: string
    baseWeight?: number
    images?: string[]
  }
}
