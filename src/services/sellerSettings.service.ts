// src/services/sellerSettings.service.ts
import api from './api'
import { SellerSettings, CreateSellerSettingsData } from '@/types'

export const sellerSettingsService = {
  /**
   * Get seller settings
   */
  async get(): Promise<{ sellerSettings: SellerSettings }> {
    const response = await api.get('/api/business/compranomia/seller-settings')

    if (response.data.status === 'success') {
      return { sellerSettings: response.data.data.sellerSettings }
    }

    throw new Error(response.data.message || 'GetSellerSettingsFailed')
  },

  /**
   * Create or update seller settings
   */
  async createOrUpdate(
    data: CreateSellerSettingsData,
  ): Promise<{ sellerSettings: SellerSettings }> {
    const response = await api.post(
      '/api/business/compranomia/seller-settings',
      data,
    )

    if (response.data.status === 'success') {
      return { sellerSettings: response.data.data.sellerSettings }
    }

    throw new Error(response.data.message || 'CreateSellerSettingsFailed')
  },
}
