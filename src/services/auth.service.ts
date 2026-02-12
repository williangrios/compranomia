// src/services/auth.service.ts
import api from './api'
import { storageService } from './storage.service'
import { apiCache } from '@/utils/apiCache'
import { User, SignUpData, SignInData, VerifyEmailData } from '@/types'

export const authService = {
  async signUp(data: SignUpData): Promise<{ user: User }> {
    console.log('[authService] signUp - Data enviada:', data)
    const response = await api.post('/api/auth/signup', data)
    console.log('[authService] signUp - Resposta:', response.data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      const token = response.data.data.token // ← precisa pegar o token aqui

      console.log('[authService] signUp - Token received:', !!token)
      if (token) {
        await storageService.saveAuthToken(token)
      }
      await storageService.saveUserData(user)
      return { user }
    }
    throw new Error(response.data.message || 'SignUpFailed')
  },

  async signIn(data: SignInData): Promise<{ user: User }> {
    console.log('[authService] signIn - Data enviada:', data)
    const response = await api.post('/api/auth/signin', data)
    console.log('[authService] signIn - Resposta:', response.data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      const token = response.data.data.token // ← precisa pegar o token aqui

      console.log('[authService] signIn - Token received:', !!token)
      if (token) {
        await storageService.saveAuthToken(token)
      }
      await storageService.saveUserData(user)
      console.log('[authService] signIn - User and token saved')
      return { user }
    }
    throw new Error(response.data.message || 'SignInFailed')
  },

  async verifyEmail(data: VerifyEmailData): Promise<{ user: User }> {
    console.log('[authService] verifyEmail - Data enviada:', data)
    const response = await api.post('/api/auth/verifyemail', data)
    console.log('[authService] verifyEmail - Resposta:', response.data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      const token = response.data.data.token

      console.log('[authService] verifyEmail - Token received:', !!token)
      if (token) {
        await storageService.saveAuthToken(token)
      }
      await storageService.saveUserData(user)
      return { user }
    }
    throw new Error(response.data.message || 'VerifyEmailFailed')
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('[authService] getCurrentUser - Fetching...')
      const response = await api.get('/api/auth/currentuser')
      console.log('[authService] getCurrentUser - Response:', response.data)

      if (response.data.status === 'success') {
        const user = response.data.data.currentUser
        if (user) {
          await storageService.saveUserData(user)
          return user
        }
      }
      return null
    } catch (error) {
      console.error('[authService] getCurrentUser error:', error)
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('[authService] logout - Starting...')
      await api.post('/api/auth/signout')
    } catch (error) {
      console.error('[authService] logout error:', error)
    } finally {
      await storageService.clearAuth()
      apiCache.clear()
      console.log('[authService] logout - Complete')
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const userData = await storageService.getUserData()
    return userData !== null
  },

  async getCachedUser(): Promise<User | null> {
    return await storageService.getUserData()
  },

  async updateCachedUser(user: User): Promise<void> {
    await storageService.saveUserData(user)
  },

  async getCurrentUserData(): Promise<User | null> {
    try {
      console.log('[authService] getCurrentUserData - Fetching from DB...')
      const response = await api.get('/api/auth/getcurrentuserdata')

      if (response.data.status === 'success' && response.data.data.user) {
        const user = response.data.data.user
        await storageService.saveUserData(user)
        console.log('[authService] getCurrentUserData - User updated:', {
          isAddressDataProvided: user.isAddressDataProvided,
          isBusinessDataProvided: user.isBusinessDataProvided,
          isPersonalDataProvided: user.isPersonalDataProvided,
        })
        return user
      }
      return null
    } catch (error) {
      console.error('[authService] getCurrentUserData error:', error)
      return null
    }
  },
}
