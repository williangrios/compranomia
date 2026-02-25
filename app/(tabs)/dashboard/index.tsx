import { View, Text, ActivityIndicator } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { useCallback, useState } from 'react'
import { DashboardActionItem } from '@/components/dashboard/DashboardActionItem'
import { colors } from '@/theme'
import { useAuth } from '@/contexts/AuthContext'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { Screen } from '@/components/layout/Screen'
import { dashboardService, DashboardStats } from '@/services/dashboard.service'
import { getDateRanges } from '@/utils/timezone'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const [statsData, setStatsData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const { todayStart } = getDateRanges(user!.timeZone)
      const data = await dashboardService.getStats({ startDate: todayStart })
      setStatsData(data)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Atualiza sempre que voltar pra tela
  useFocusEffect(
    useCallback(() => {
      loadDashboard()
    }, []),
  )

  // Cálculos seguros
  const todayOrders =
    (statsData?.ordersByStatus?.Pending || 0) +
    (statsData?.ordersByStatus?.Confirmed || 0) +
    (statsData?.ordersByStatus?.Preparing || 0) +
    (statsData?.ordersByStatus?.Delivering || 0) +
    (statsData?.ordersByStatus?.Delivered || 0)

  const concluded = statsData?.ordersByStatus?.Delivered || 0
  const pending = statsData?.pendingAction?.count || 0
  const todaySales = statsData?.revenue?.today || 0

  const stats = [
    {
      icon: 'ShoppingCart',
      label: 'Vendas Hoje',
      value: todayOrders.toString(),
      color: colors.primary,
    },
    {
      icon: 'Banknote',
      label: 'Faturamento Hoje (vendas entregues)',
      value: formatCurrency(todaySales),
      color: '#10B981',
    },
    {
      icon: 'Clock',
      label: 'Vendas pendentes',
      value: pending.toString(),
      color: '#F59E0B',
    },
    {
      icon: 'CheckCircle',
      label: 'Vendas entregues',
      value: concluded.toString(),
      color: '#6366F1',
    },
  ] as const

  return (
    <Screen>
      {/* Seller info */}
      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          {user?.nickName ? capitalizeFullName(user.nickName) : ''}
        </Text>
      </View>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      {/* Error */}
      {error && <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>}

      {/* 📊 Cards */}
      {!loading && !error && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {stats.map((stat, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                minWidth: '45%',
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: stat.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Icon icon={stat.icon} size={20} color={stat.color} />
              </View>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                }}
              >
                {stat.value}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ⚡ Ações rápidas */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.textPrimary,
          marginBottom: 12,
        }}
      >
        Ações rápidas
      </Text>

      <DashboardActionItem
        title="Ver todas as vendas"
        subtitle="Gerencie seus pedidos"
        icon="ReceiptText"
        onPress={() => router.push('/sales')}
      />
      <DashboardActionItem
        title="Ver notificações"
        subtitle="Confira suas notificações recebidas"
        icon="Bell"
        onPress={() => router.push('/notifications')}
      />
      <DashboardActionItem
        title="Gerenciar produtos"
        subtitle="Adicionar ou editar produtos"
        icon="Tag"
        onPress={() => router.push('/dashboard/products')}
      />
      <DashboardActionItem
        title="Perfil do negócio"
        subtitle="Informações públicas da loja"
        icon="Store"
        onPress={() => router.push('/dashboard/business-profile')}
      />
      <DashboardActionItem
        title="Configurações do negócio"
        subtitle="Entrega, horários e taxas"
        icon="Settings"
        onPress={() => router.push('/dashboard/seller-settings')}
      />
      <DashboardActionItem
        title="Endereço do negócio"
        subtitle="Localização da loja"
        icon="MapPin"
        onPress={() => router.push('/dashboard/business-address')}
      />
    </Screen>
  )
}
