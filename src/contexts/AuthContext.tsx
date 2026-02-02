// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { authService } from '@/services/auth.service'
import api from '@/services/api'
import { User } from '@/types'
import { Country, Tenant, UserRole } from '@wrcb/cb-common'
import { formatApiError } from '@/utils/errorHandler'

interface AuthContextData {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: {
    email: string
    password: string
    passwordConfirmation: string
    nickName: string
    role: UserRole
  }) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  updatePassword: (data: {
    currentPassword: string
    newPassword: string
    newPasswordConfirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome')
      return
    }

    if (user && !user.isEmailVerified && !inAuthGroup) {
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: user.email },
      })
      return
    }

    if (
      user &&
      user.isEmailVerified &&
      user.role === UserRole.Consumer &&
      !user.isAddressDataProvided
    ) {
      router.replace('/(auth)/complete-address')
      return
    }

    if (
      user &&
      user.isEmailVerified &&
      (user.role === UserRole.Seller || user.isAddressDataProvided) &&
      inAuthGroup
    ) {
      router.replace('/(tabs)')
    }
  }, [user, segments, isLoading])

  async function checkAuth() {
    try {
      console.log('[AuthContext] checkAuth - Starting...')
      setIsLoading(true)
      const cachedUser = await authService.getCachedUser()

      if (cachedUser) {
        console.log(
          '[AuthContext] checkAuth - Found cached user:',
          cachedUser.id,
        )
        setUser(cachedUser)

        authService
          .getCurrentUser()
          .then((freshUser) => {
            if (freshUser) {
              console.log('[AuthContext] checkAuth - Got fresh user')
              setUser(freshUser)
            } else {
              console.log('[AuthContext] checkAuth - No fresh user, clearing')
              setUser(null)
            }
          })
          .catch(() => {
            console.log('[AuthContext] checkAuth - Error getting fresh user')
            setUser(null)
          })
      } else {
        console.log('[AuthContext] checkAuth - No cached user')
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log('[AuthContext] signIn - Starting...')
      const { user } = await authService.signIn({
        email,
        password,
        tenant: Tenant.Compranomia,
      })
      console.log('[AuthContext] signIn - Setting user state')
      setUser(user)
    } catch (error: any) {
      console.error('[AuthContext] signIn - Error:', error)
      throw formatApiError(error)
    }
  }

  async function signUp(data: {
    email: string
    password: string
    passwordConfirmation: string
    nickName: string
    role: UserRole
  }) {
    try {
      console.log('[AuthContext] signUp - Starting...')
      const { user } = await authService.signUp({
        ...data,
        country: Country.Brasil,
        tenant: Tenant.Compranomia,
      })
      console.log('[AuthContext] signUp - Setting user state')
      setUser(user)
    } catch (error: any) {
      console.error('[AuthContext] signUp - Error:', error)
      throw formatApiError(error)
    }
  }

  async function verifyEmail(email: string, code: string) {
    try {
      console.log('[AuthContext] verifyEmail - Starting...')
      const { user } = await authService.verifyEmail({
        email,
        code,
        tenant: Tenant.Compranomia,
      })
      console.log('[AuthContext] verifyEmail - Setting user state')
      setUser(user)
    } catch (error: any) {
      console.error('[AuthContext] verifyEmail - Error:', error)
      throw formatApiError(error)
    }
  }

  async function updatePassword(data: {
    currentPassword: string
    newPassword: string
    newPasswordConfirmation: string
  }) {
    try {
      console.log('[AuthContext] updatePassword - Starting...')
      await api.put('/api/auth/updateuserpassword', data)
      console.log('[AuthContext] updatePassword - Success')
    } catch (error: any) {
      console.error('[AuthContext] updatePassword - Error:', error)
      throw formatApiError(error)
    }
  }

  async function logout() {
    console.log('[AuthContext] logout - Starting...')
    await authService.logout()
    setUser(null)
    router.replace('/(auth)/welcome')
  }

  async function refreshUser() {
    try {
      console.log('[AuthContext] refreshUser - Starting...')
      const freshUser = await authService.getCurrentUser()
      if (freshUser) {
        console.log('[AuthContext] refreshUser - Got fresh user')
        setUser(freshUser)
      }
    } catch (error) {
      console.error('[AuthContext] refreshUser - Error:', error)
    }
  }

  function updateUser(updatedUser: User) {
    console.log('[AuthContext] updateUser - Updating:', updatedUser.id)
    setUser(updatedUser)
    authService.updateCachedUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        verifyEmail,
        updatePassword,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
