// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { authService } from '@/services/auth.service'
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

  // Verificar autenticação ao iniciar app
  useEffect(() => {
    checkAuth()
  }, [])

  // Navegar baseado em autenticação
  useEffect(() => {
    console.log('🧭 Navigation effect TRIGGERED:', {
      isLoading,
      user: !!user,
      userId: user?.id,
      isEmailVerified: user?.isEmailVerified,
      isAddressDataProvided: user?.isAddressDataProvided,
      role: user?.role,
      segments,
      timestamp: new Date().toISOString(),
    })

    if (isLoading) {
      console.log('⏳ Ainda carregando, aguardando...')
      return
    }

    const inAuthGroup = segments[0] === '(auth)'
    const inTabsGroup = segments[0] === '(tabs)'

    console.log('📍 Grupos:', { inAuthGroup, inTabsGroup })

    // 1. Não autenticado → welcome
    if (!user && !inAuthGroup) {
      console.log('🚀 Redirecionando para (auth)/welcome')
      router.replace('/(auth)/welcome')
      return
    }

    // 2. Email não verificado → verify-email
    if (user && !user.isEmailVerified && !inAuthGroup) {
      console.log('🚀 Redirecionando para (auth)/verify-email')
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: user.email },
      })
      return
    }

    // 3. Consumer sem endereço → complete-address
    // ✅ REMOVER !inAuthGroup
    if (
      user &&
      user.isEmailVerified &&
      user.role === UserRole.Consumer &&
      !user.isAddressDataProvided
    ) {
      console.log('🚀 Redirecionando para (auth)/complete-address')
      router.replace('/(auth)/complete-address')
      return
    }

    // 4. Usuário completo em auth → tabs
    if (
      user &&
      user.isEmailVerified &&
      (user.role === UserRole.Seller || user.isAddressDataProvided) &&
      inAuthGroup
    ) {
      console.log('🚀 Redirecionando para (tabs)')
      router.replace('/(tabs)')
      return
    }

    console.log('⚠️ Nenhuma condição de navegação atendida')
  }, [user, segments, isLoading])

  async function checkAuth() {
    try {
      console.log('🔍 checkAuth: Iniciando...')
      setIsLoading(true)

      const cachedUser = await authService.getCachedUser()
      console.log('👤 Cached user:', cachedUser)

      if (cachedUser) {
        setUser(cachedUser)
        console.log('✅ User setado do cache')

        // Validar com backend (sem bloquear)
        authService
          .getCurrentUser()
          .then((freshUser) => {
            console.log('🔄 Fresh user from API:', freshUser)
            if (freshUser) {
              setUser(freshUser)
            } else {
              setUser(null)
              console.log('❌ Fresh user null')
            }
          })
          .catch((err) => {
            console.log('❌ Erro ao buscar fresh user:', err)
            setUser(null)
          })
      } else {
        setUser(null)
        console.log('❌ Sem cached user')
      }
    } catch (error) {
      console.error('❌ checkAuth error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
      console.log('✅ checkAuth: Finalizado')
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log('📤 AuthContext.signIn - Chamando authService')

      const { user } = await authService.signIn({
        email,
        password,
        tenant: Tenant.Compranomia,
      })

      console.log('✅ AuthContext.signIn - Sucesso')
      setUser(user)
    } catch (error: any) {
      console.error('❌ signIn error:', error)
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
      console.log('📤 AuthContext.signUp - Chamando authService')

      const { user } = await authService.signUp({
        ...data,
        country: Country.Brasil,
        tenant: Tenant.Compranomia,
      })

      console.log('✅ AuthContext.signUp - Sucesso')
      setUser(user)
    } catch (error: any) {
      console.error('❌ signUp error:', error)
      throw formatApiError(error)
    }
  }

  async function verifyEmail(email: string, code: string) {
    try {
      console.log('📤 AuthContext.verifyEmail - Chamando authService')

      const { user } = await authService.verifyEmail({
        email,
        code,
        tenant: Tenant.Compranomia,
      })

      console.log('✅ AuthContext.verifyEmail - User recebido:', {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        isAddressDataProvided: user.isAddressDataProvided,
      })

      console.log('📝 AuthContext.verifyEmail - Atualizando state do user...')
      setUser(user)

      console.log('⏳ AuthContext.verifyEmail - Aguardando state atualizar...')
      await new Promise((resolve) => setTimeout(resolve, 200))

      console.log('✅ AuthContext.verifyEmail - Concluído!')
    } catch (error: any) {
      console.error('❌ verifyEmail error:', error)
      throw formatApiError(error)
    }
  }

  async function logout() {
    try {
      await authService.logout()
      setUser(null)
      router.replace('/(auth)/welcome')
    } catch (error) {
      console.error('logout error:', error)
    }
  }

  async function refreshUser() {
    try {
      const freshUser = await authService.getCurrentUser()
      if (freshUser) {
        setUser(freshUser)
      }
    } catch (error) {
      console.error('refreshUser error:', error)
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
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
