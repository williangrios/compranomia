// src/services/profile.service.ts
import api from './api'
import { User, UpdateUserPersonalData, UpdateUserBusinessData } from '@/types'
import { storageService } from './storage.service'

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

  async updatePersonalData(
    data: UpdateUserPersonalData,
  ): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuserdata', data)
    if (response.data.status === 'success') {
      const { user, token } = response.data.data
      if (token) {
        await storageService.saveAuthToken(token)
      }
      return { user }
    }
    throw new Error(response.data.message || 'UpdatePersonalDataFailed')
  },

  async updateAddress(data: {
    postalCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    country: string
    location?: { coordinates: [number, number] }
  }): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuseraddress', data)
    if (response.data.status === 'success') {
      const { user, token } = response.data.data
      if (token) {
        await storageService.saveAuthToken(token)
      }
      return { user }
    }
    throw new Error(response.data.message || 'UpdateAddressFailed')
  },

  async updateBusinessProfile(
    data: UpdateUserBusinessData,
  ): Promise<{ user: User }> {
    const response = await api.put('/api/auth/updateuserbusiness', data)
    if (response.data.status === 'success') {
      const { user, token } = response.data.data
      if (token) {
        await storageService.saveAuthToken(token)
      }
      return { user }
    }
    throw new Error(response.data.message || 'UpdateBusinessProfileFailed')
  },

  async updateBusinessProfileWithPhoto(
    formData: FormData,
  ): Promise<{ user: User }> {
    try {
      const response = await api.put('/api/auth/updateuserbusiness', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.data.status === 'success') {
        const { user, token } = response.data.data
        if (token) {
          await storageService.saveAuthToken(token)
        }
        return { user }
      }
      throw new Error(response.data.message || 'UpdateBusinessProfileFailed')
    } catch (error: any) {
      throw error
    }
  },

  async refreshUserData(): Promise<{ user: User }> {
    const response = await api.get('/api/auth/getcurrentuserdata')
    if (response.data.status === 'success') {
      const { user, token } = response.data.data
      if (token) {
        await storageService.saveAuthToken(token)
      }
      return { user }
    }
    throw new Error(response.data.message || 'RefreshUserDataFailed')
  },
}
