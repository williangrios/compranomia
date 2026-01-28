// src/services/profile.service.ts
import api from './api'
import { User, UpdateUserPersonalData, UpdateUserBusinessData } from '@/types'

export const profileService = {
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
   * Update business profile
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
}
