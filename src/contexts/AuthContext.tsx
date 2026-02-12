import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { authService } from '@/services/auth.service'
import api from '@/services/api'
import { User } from '@/types'
import { Country, Tenant, UserRole } from '@wrcb/cb-common'
import { useAddress } from '@/contexts/AddressContext'

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

  const { checkIfHasDeliveryAddress, hasDeliveryAddress } = useAddress()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    if (!user.isEmailVerified) return
    if (user.role !== UserRole.Consumer) return

    checkIfHasDeliveryAddress()
  }, [isLoading, user?.id])

  useEffect(() => {
    if (isLoading) return
    if (
      user &&
      user.isEmailVerified &&
      user.role === UserRole.Consumer &&
      hasDeliveryAddress === null
    ) {
      return
    }
    const inAuthGroup = segments[0] === '(auth)'

    // 1️⃣ Não autenticado
    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome')
      }
      return
    }

    // 2️⃣ Email NÃO verificado
    if (!user.isEmailVerified) {
      if (!inAuthGroup) {
        router.replace({
          pathname: '/(auth)/verify-email',
          params: { email: user.email },
        })
      }
      return
    }

    // 3️⃣ Seller → nunca depende de endereço
    if (user.role === UserRole.Seller) {
      if (inAuthGroup) {
        router.replace('/(tabs)')
      }
      return
    }

    // 4️⃣ Consumer SEM delivery address
    if (hasDeliveryAddress === false) {
      if (!inAuthGroup) {
        router.replace('/(auth)/complete-address')
      }
      return
    }

    // 5️⃣ Consumer COM delivery address
    if (hasDeliveryAddress === true) {
      if (inAuthGroup) {
        router.replace('/(tabs)')
      }
      return
    }
  }, [user, hasDeliveryAddress, segments, isLoading])

  async function checkAuth() {
    console.log('🔴 [AuthContext] checkAuth INICIADO')
    try {
      setIsLoading(true)
      const cachedUser = await authService.getCachedUser()

      if (cachedUser) {
        console.log('🟡 [AuthContext] Carregando do CACHE:', {
          isAddressDataProvided: cachedUser.isAddressDataProvided,
        })
        setUser(cachedUser) // ✅ Confia 100% no cache
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
