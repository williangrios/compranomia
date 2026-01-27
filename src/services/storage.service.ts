// src/services/storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/utils/constants'

export const storageService = {
  // Auth Token
  async saveAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  },

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  // User Data
  async saveUserData(user: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
  },

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
    return data ? JSON.parse(data) : null
  },

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA)
  },

  // Selected Address
  async saveSelectedAddress(address: any): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SELECTED_ADDRESS,
      JSON.stringify(address),
    )
  },

  async getSelectedAddress(): Promise<any | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS)
    return data ? JSON.parse(data) : null
  },

  async removeSelectedAddress(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_ADDRESS)
  },

  // Clear All Auth Data
  async clearAuth(): Promise<void> {
    await Promise.all([
      this.removeAuthToken(),
      this.removeUserData(),
      this.removeSelectedAddress(),
    ])
  },
}
