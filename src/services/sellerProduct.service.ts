import api from './api'

export const sellerProductService = {
  // 🔹 Lista produtos do seller
  async list() {
    const { data } = await api.get('/api/business/compranomia/seller-product')
    return data
  },

  // 🔹 Cria produto (catalog + sellerProduct)
  async create(payload: {
    name: string
    description?: string
    brand?: string
    productCategory?: string
    measurementUnit?: string
    baseWeight?: number
    price: number
    stock: number
    minStockAlert?: number
    images?: { uri: string }[]
  }) {
    const formData = new FormData()

    // 📌 Campos obrigatórios
    formData.append('name', payload.name)
    formData.append('price', String(payload.price))
    formData.append('stock', String(payload.stock))

    // 📌 Campos opcionais
    if (payload.description) formData.append('description', payload.description)

    if (payload.brand) formData.append('brand', payload.brand)

    if (payload.productCategory)
      formData.append('productCategory', payload.productCategory)

    if (payload.measurementUnit)
      formData.append('measurementUnit', payload.measurementUnit)

    if (typeof payload.baseWeight === 'number')
      formData.append('baseWeight', String(payload.baseWeight))

    if (typeof payload.minStockAlert === 'number')
      formData.append('minStockAlert', String(payload.minStockAlert))

    // 📸 Imagens
    if (payload.images?.length) {
      payload.images.forEach((img, index) => {
        formData.append('originalImages', {
          uri: img.uri,
          name: `product-${index}.jpg`,
          type: 'image/jpeg',
        } as any)
      })
    }

    const { data } = await api.post(
      '/api/business/compranomia/catalog/new',
      formData,
    )

    return data
  },
}
