// src/services/deliveryAddress.service.ts
import api from './api'
import {
  DeliveryAddress,
  CreateDeliveryAddressData,
  UpdateDeliveryAddressData,
  ViaCEPResponse,
} from '@/types'

export const deliveryAddressService = {
  /**
   * Create Delivery Address
   */
  async create(
    data: CreateDeliveryAddressData,
  ): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.post(
      '/api/business/compranomia/delivery-address',
      data,
    )

    if (response.data.status === 'success') {
      return { deliveryAddress: response.data.data.deliveryAddress }
    }

    throw new Error(response.data.message || 'CreateAddressFailed')
  },

  /**
   * List all delivery addresses
   */
  async list(): Promise<{ deliveryAddresses: DeliveryAddress[] }> {
    const response = await api.get('/api/business/compranomia/delivery-address')

    if (response.data.status === 'success') {
      return { deliveryAddresses: response.data.data.deliveryAddresses }
    }

    throw new Error(response.data.message || 'ListAddressesFailed')
  },

  /**
   * Get single delivery address
   */
  async getById(id: string): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.get(
      `/api/business/compranomia/delivery-address/${id}`,
    )

    if (response.data.status === 'success') {
      return { deliveryAddress: response.data.data.deliveryAddress }
    }

    throw new Error(response.data.message || 'GetAddressFailed')
  },

  /**
   * Update delivery address
   */
  async update(
    id: string,
    data: UpdateDeliveryAddressData,
  ): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.put(
      `/api/business/compranomia/delivery-address/${id}`,
      data,
    )

    if (response.data.status === 'success') {
      return { deliveryAddress: response.data.data.deliveryAddress }
    }

    throw new Error(response.data.message || 'UpdateAddressFailed')
  },

  /**
   * Delete delivery address
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete(
      `/api/business/compranomia/delivery-address/${id}`,
    )

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'DeleteAddressFailed')
    }
  },

  /**
   * Set address as default
   */
  async setDefault(id: string): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.patch(
      `/api/business/compranomia/delivery-address/${id}/set-default`,
    )

    if (response.data.status === 'success') {
      return { deliveryAddress: response.data.data.deliveryAddress }
    }

    throw new Error(response.data.message || 'SetDefaultFailed')
  },

  /**
   * Get address by CEP (ViaCEP API)
   */
  async getAddressByCEP(cep: string): Promise<ViaCEPResponse> {
    const cleanCEP = cep.replace(/\D/g, '')

    if (cleanCEP.length !== 8) {
      throw new Error('CEP inválido')
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP')
    }

    const data: ViaCEPResponse = await response.json()

    if (data.erro) {
      throw new Error('CEP não encontrado')
    }

    return data
  },
}
