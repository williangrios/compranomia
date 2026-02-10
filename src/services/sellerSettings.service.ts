// src/services/sellerSettings.service.ts
import { SellerSettingsPayload } from '@/types/sellerSettings.types'
import api from './api'
import { SellerSettings } from '@/types'

export const sellerSettingsService = {
  /**
   * Get seller settings
   */
  async getSettings(): Promise<{ sellerSettings: SellerSettings }> {
    const response = await api.get('/api/business/compranomia/seller-settings')
    if (response.data.status === 'success') {
      return { sellerSettings: response.data.data.sellerSettings }
    }
    console.log(
      '-----------------chegou settings=======',
      response.data.message,
    )
    console.log('-----------------chegou settings=======', response.data)
    throw new Error(response.data.message || 'GetSellerSettingsFailed')
  },

  /**
   * Create or update seller settings (upsert via PATCH)
   */
  async upsertSettings(
    payload: SellerSettingsPayload,
  ): Promise<{ sellerSettings: SellerSettings }> {
    const response = await api.patch(
      '/api/business/compranomia/seller-settings',
      payload,
    )
    if (response.data.status === 'success') {
      return { sellerSettings: response.data.data.sellerSettings }
    }
    throw new Error(response.data.message || 'UpsertSellerSettingsFailed')
  },
}
