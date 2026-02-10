import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { authService } from '@/services/auth.service'
import api from '@/services/api'
import { User } from '@/types'
import { Country, Tenant, UserRole } from '@wrcb/cb-common'

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

    // 🔒 Não autenticado
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome')
      return
    }

    // 📧 Email não verificado
    if (user && !user.isEmailVerified && !inAuthGroup) {
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: user.email },
      })
      return
    }

    // 🏠 Onboarding de endereço
    // 👉 SÓ força se estiver dentro de (auth)
    if (
      user &&
      user.isEmailVerified &&
      user.role === UserRole.Consumer &&
      !user.isAddressDataProvided &&
      inAuthGroup
    ) {
      router.replace('/(auth)/complete-address')
      return
    }

    // ✅ Usuário pronto → sai do auth
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
      setIsLoading(true)

      const cachedUser = await authService.getCachedUser()

      if (cachedUser) {
        // 1️⃣ Mostra imediatamente o usuário completo do cache
        setUser(cachedUser)

        // 2️⃣ Busca atualização do backend (JWT)
        authService
          .getCurrentUser()
          .then((freshUser) => {
            if (!freshUser) {
              setUser(null)
              return
            }

            // 3️⃣ MERGE: mantém dados completos + atualiza o que veio do JWT
            const mergedUser = {
              ...cachedUser,
              ...freshUser,
            }

            setUser(mergedUser)
            authService.updateCachedUser(mergedUser)
          })
          .catch(() => {
            // Se falhar a request, mantém o cache
            setUser(cachedUser)
          })
      } else {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { user } = await authService.signIn({
        email,
        password,
        tenant: Tenant.Compranomia,
      })
      setUser(user)
    } catch (error: any) {
      throw error
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
      const { user } = await authService.signUp({
        ...data,
        country: Country.Brasil,
        tenant: Tenant.Compranomia,
      })
      setUser(user)
    } catch (error: any) {
      throw error
    }
  }

  async function verifyEmail(email: string, code: string) {
    try {
      const { user } = await authService.verifyEmail({
        email,
        code,
        tenant: Tenant.Compranomia,
      })
      setUser(user)
    } catch (error: any) {
      throw error
    }
  }

  async function updatePassword(data: {
    currentPassword: string
    newPassword: string
    newPasswordConfirmation: string
  }) {
    try {
      await api.put('/api/auth/updateuserpassword', data)
    } catch (error: any) {
      throw error
    }
  }

  async function logout() {
    await authService.logout()
    setUser(null)
    router.replace('/(auth)/welcome')
  }

  async function refreshUser() {
    try {
      const freshUser = await authService.getCurrentUser()
      if (freshUser) {
        setUser(freshUser)
      }
    } catch (error) {
      console.error('[AuthContext] refreshUser error', error)
    }
  }

  function updateUser(updatedUser: User) {
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
