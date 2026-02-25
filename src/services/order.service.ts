import api from './api'
import { PaymentMethod } from '@wrcb/cb-common'

interface CreateOrderPayload {
  sellerId: string
  deliveryAddress: {
    label: string
    cep: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    reference?: string
    deliveryInstructions?: string
    location: {
      coordinates: [number, number]
    }
  }
  items: {
    sellerProductId: string
    quantity: number
    price: number
    promotionalPrice?: number | null
  }[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  estimatedDeliveryDate: string
  observations?: string
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const response = await api.post('/api/business/compranomia/orders', payload)
    return response.data.data
  },
  async getOrders(params: {
    mode: 'sale' | 'purchase'
    status?: string
    limit?: number
    skip?: number
  }) {
    const response = await api.get('/api/business/compranomia/orders', {
      params,
    })
    return response.data.data
  },

  async getOrder(orderId: string) {
    const response = await api.get(
      `/api/business/compranomia/orders/${orderId}`,
    )
    return response.data.data
  },

  // order.service.ts
  async updateStatus(
    orderId: string,
    status: string,
    cancellationReason?: string,
  ) {
    const response = await api.patch(
      `/api/business/compranomia/orders/${orderId}/status`,
      { status, ...(cancellationReason ? { cancellationReason } : {}) },
    )
    return response.data.data
  },

  async cancelOrder(orderId: string, reason: string) {
    const response = await api.patch(
      `/api/business/compranomia/orders/${orderId}/cancel`,
      { reason },
    )
    return response.data.data
  },

  async sendMessage(orderId: string, message?: string, image?: any) {
    if (image) {
      const formData = new FormData()
      if (message) formData.append('message', message)
      formData.append('image', image as any)

      try {
        const response = await api.post(
          `/api/business/compranomia/orders/${orderId}/messages`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )
        return response.data.data
      } catch (error: any) {
        throw error
      }
    }

    const response = await api.post(
      `/api/business/compranomia/orders/${orderId}/messages`,
      { message },
    )
    return response.data.data
  },

  async markMessagesRead(orderId: string) {
    const response = await api.patch(
      `/api/business/compranomia/orders/${orderId}/messages/read`,
    )
    return response.data.data
  },
}
