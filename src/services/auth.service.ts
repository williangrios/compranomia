// src/services/auth.service.ts
import api from './api'
import { storageService } from './storage.service'
import { apiCache } from '@/utils/apiCache'
import { User, SignUpData, SignInData, VerifyEmailData } from '@/types'

export const authService = {
  /**
   * Sign Up - Criar nova conta
   */
  async signUp(data: SignUpData): Promise<{ user: User }> {
    console.log('🚀 authService.signUp - Data enviada:', data)

    const response = await api.post('/api/auth/signup', data)

    console.log('✅ authService.signUp - Resposta:', response.data)

    if (response.data.status === 'success') {
      const user = response.data.data.user
      await storageService.saveUserData(user)
      return { user }
    }

    throw new Error(response.data.message || 'SignUpFailed')
  },

  /**
   * Sign In - Fazer login
   */
  async signIn(data: SignInData): Promise<{ user: User }> {
    const response = await api.post('/api/auth/signin', data)

    if (response.data.status === 'success') {
      const user = response.data.data.user

      // Salvar dados localmente
      await storageService.saveUserData(user)

      return { user }
    }

    throw new Error(response.data.message || 'SignInFailed')
  },

  /**
   * Verify Email - Confirmar email com código
   */
  async verifyEmail(data: VerifyEmailData): Promise<{ user: User }> {
    const response = await api.post('/api/auth/verifyemail', data)

    if (response.data.status === 'success') {
      const user = response.data.data.user

      // Atualizar dados localmente
      await storageService.saveUserData(user)

      return { user }
    }

    throw new Error(response.data.message || 'VerifyEmailFailed')
  },

  /**
   * Get Current User - Buscar usuário atual (verifica se está logado)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/api/auth/currentuser')

      if (response.data.status === 'success') {
        const user = response.data.data.currentUser

        if (user) {
          // Atualizar cache local
          await storageService.saveUserData(user)
          return user
        }
      }

      return null
    } catch (error) {
      console.error('getCurrentUser error:', error)
      return null
    }
  },

  /**
   * Logout - Fazer logout
   */
  async logout(): Promise<void> {
    try {
      // Tentar fazer logout no backend (se houver rota)
      await api.post('/api/auth/signout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Limpar dados locais independentemente
      await storageService.clearAuth()
      apiCache.clear()
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const userData = await storageService.getUserData()
    return userData !== null
  },

  /**
   * Get cached user data (sem fazer request)
   */
  async getCachedUser(): Promise<User | null> {
    return await storageService.getUserData()
  },

  /**
   * Update cached user data
   */
  async updateCachedUser(user: User): Promise<void> {
    await storageService.saveUserData(user)
  },
}
