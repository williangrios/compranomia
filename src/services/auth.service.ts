// src/services/auth.service.ts
import api from './api'
import { storageService } from './storage.service'
import { apiCache } from '@/utils/apiCache'
import { User, SignUpData, SignInData, VerifyEmailData } from '@/types'

export const authService = {
  async signUp(data: SignUpData): Promise<{ user: User }> {
    await storageService.clearAuth()
    apiCache.clear()
    const response = await api.post('/api/auth/signup', data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      const token = response.data.data.token // ← precisa pegar o token aqui

      if (token) {
        await storageService.saveAuthToken(token)
      }
      await storageService.saveUserData(user)
      return { user }
    }
    throw new Error(response.data.message || 'SignUpFailed')
  },

  async signIn(data: SignInData): Promise<{ user: User }> {
    await storageService.clearAuth()
    apiCache.clear()
    const response = await api.post('/api/auth/signin', data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      const token = response.data.data.token // ← precisa pegar o token aqui

      if (token) {
        await storageService.saveAuthToken(token)
      }
      await storageService.saveUserData(user)
      return { user }
    }
    throw new Error(response.data.message || 'SignInFailed')
  },

  async verifyEmail(data: VerifyEmailData): Promise<{ user: User }> {
    const response = await api.post('/api/auth/verifyemail', data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      const token = response.data.data.token

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
      const response = await api.get('/api/auth/currentuser')

      if (response.data.status === 'success') {
        const user = response.data.data.currentUser
        if (user) {
          await storageService.saveUserData(user)
          return user
        }
      }
      return null
    } catch (error) {
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/signout')
    } catch (error) {
      console.error('[authService] logout error:', error)
    } finally {
      await storageService.clearAuth()
      apiCache.clear()
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
      const response = await api.get('/api/auth/getcurrentuserdata')

      if (response.data.status === 'success' && response.data.data.user) {
        const user = response.data.data.user
        await storageService.saveUserData(user)
        return user
      }
      return null
    } catch (error) {
      return null
    }
  },

  async resendVerificationCode(): Promise<void> {
    await api.post('/api/auth/requestlinkandcodetoverifyemail')
  },
}
