// src/services/deliveryAddress.service.ts
import api from './api'
import {
  DeliveryAddress,
  CreateDeliveryAddressData,
  UpdateDeliveryAddressData,
  ViaCEPResponse,
} from '@/types'

export const deliveryAddressService = {
  async create(
    data: CreateDeliveryAddressData,
  ): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.post(
      '/api/business/compranomia/delivery-address',
      data,
    )
    return response.data.data
  },

  async list(): Promise<{ deliveryAddresses: DeliveryAddress[] }> {
    const response = await api.get('/api/business/compranomia/delivery-address')
    console.log('endereços-----------', response.data.data)
    return response.data.data
  },

  async getById(id: string): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.get(
      `/api/business/compranomia/delivery-address/${id}`,
    )
    return response.data.data
  },

  async update(
    id: string,
    data: UpdateDeliveryAddressData,
  ): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.patch(
      `/api/business/compranomia/delivery-address/${id}`,
      data,
    )
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/business/compranomia/delivery-address/${id}`) // ← CORRIGIDO: era template tag
  },

  async setDefault(id: string): Promise<{ deliveryAddress: DeliveryAddress }> {
    const response = await api.patch(
      `/api/business/compranomia/delivery-address/${id}/set-default`,
    )
    return response.data.data
  },

  async getAddressByCEP(cep: string): Promise<ViaCEPResponse> {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) {
      throw new Error('CEP inválido')
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`) // ← CORRIGIDO: era template tag

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
