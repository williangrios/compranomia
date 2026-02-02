// src/services/profile.service.ts
import api from './api'
import { User, UpdateUserPersonalData, UpdateUserBusinessData } from '@/types'

export const profileService = {
  /**
   * Get current user data
   */
  async getCurrentUserData(): Promise<{ user: User }> {
    const response = await api.get('/api/auth/getcurrentuserdata')
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
    data: FormData,
  ): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuserbusiness', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.data.status === 'success') {
      return { user: response.data.data.user }
    }
    throw new Error(response.data.message || 'UpdateBusinessProfileFailed')
  },
}
