// src/services/profile.service.ts
import api from './api'
import { User, UpdateUserPersonalData, UpdateUserBusinessData } from '@/types'

export const profileService = {
  /**
   * Get current user data
   */
  async getCurrentUserData(): Promise<{ user: User }> {
    const response = await api.get('/api/auth/getcurrentuserdata')
    console.log('buscou no banco---', response.data.data.user)
    if (response.data.status === 'success') {
      return { user: response.data.data.user }
    }
    throw new Error(response.data.message || 'GetUserDataFailed')
  },

  /**
   * Update personal data
   */
  async updatePersonalData(
    data: UpdateUserPersonalData,
  ): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuserdata', data)
    if (response.data.status === 'success') {
      return { user: response.data.data.user }
    }
    throw new Error(response.data.message || 'UpdatePersonalDataFailed')
  },

  /**
   * Update address
   */
  async updateAddress(data: {
    postalCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    country: string
  }): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuseraddress', data)
    if (response.data.status === 'success') {
      return { user: response.data.data.user }
    }
    throw new Error(response.data.message || 'UpdateAddressFailed')
  },

  /**
   * Update business profile (sem foto)
   */
  async updateBusinessProfile(
    data: UpdateUserBusinessData,
  ): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuserbusiness', data)
    if (response.data.status === 'success') {
      return { user: response.data.data.user }
    }
    throw new Error(response.data.message || 'UpdateBusinessProfileFailed')
  },

  /**
   * Update business profile with photo
   */
  async updateBusinessProfileWithPhoto(
    formData: FormData,
  ): Promise<{ user: User }> {
    console.log('📤 updateBusinessProfileWithPhoto - Iniciando envio')
    console.log('📤 FormData recebido:', formData)

    // React Native FormData não tem .entries(), então vamos logar direto
    console.log('📤 Enviando FormData com multipart/form-data')

    try {
      console.log('🌐 Fazendo request para /api/auth/updateuserbusiness')

      const response = await api.put('/api/auth/updateuserbusiness', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('✅ Response recebida!')
      console.log('✅ response.status:', response.status)
      console.log('✅ response.data:', response.data)
      console.log('✅ response.data.status:', response.data?.status)

      if (response.data.status === 'success') {
        console.log('✅ Sucesso! Retornando user:', response.data.data.user)
        return { user: response.data.data.user }
      }

      console.log('❌ Status não é success')
      throw new Error(response.data.message || 'UpdateBusinessProfileFailed')
    } catch (error: any) {
      console.error('❌❌❌ ERRO CAPTURADO ❌❌❌')
      console.error('❌ error:', error)
      console.error('❌ error.message:', error.message)
      console.error('❌ error.response:', error.response)
      console.error('❌ error.response?.status:', error.response?.status)
      console.error('❌ error.response?.data:', error.response?.data)
      console.error(
        '❌ error.response?.data?.errors:',
        error.response?.data?.errors,
      )
      console.error(
        '❌ error.response?.data?.message:',
        error.response?.data?.message,
      )

      // Re-throw para o componente tratar
      throw error
    }
  },
}
