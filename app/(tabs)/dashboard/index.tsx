import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/layout/Screen'
import { DashboardActionItem } from '@/components/dashboard/DashboardActionItem'
import { colors } from '@/theme'

export default function Dashboard() {
  const router = useRouter()

  const stats = [
    {
      icon: 'cart',
      label: 'Pedidos Hoje',
      value: '0',
      color: colors.primary,
    },
    {
      icon: 'cash',
      label: 'Vendas Hoje',
      value: 'R$ 0,00',
      color: '#10B981',
    },
    {
      icon: 'time',
      label: 'Pedidos Pendentes',
      value: '0',
      color: '#F59E0B',
    },
    {
      icon: 'checkmark-circle',
      label: 'Concluídos',
      value: '0',
      color: '#6366F1',
    },
  ] as const

  return (
    <Screen>
      {/* 📊 Cards de métricas */}
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
              <Ionicons name={stat.icon} size={20} color={stat.color} />
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
        icon="receipt"
        onPress={() => router.push('/sales')}
      />

      <DashboardActionItem
        title="Ver notificações"
        subtitle="Confira suas notificações recebidas"
        icon="notifications"
        onPress={() => router.push('/notifications')}
      />

      <DashboardActionItem
        title="Gerenciar produtos"
        subtitle="Adicionar ou editar produtos"
        icon="pricetag"
        onPress={() => router.push('/dashboard/products')}
      />

      <DashboardActionItem
        title="Perfil do negócio"
        subtitle="Informações públicas da loja"
        icon="storefront"
        onPress={() => router.push('/dashboard/business-profile')}
      />

      <DashboardActionItem
        title="Configurações do negócio"
        subtitle="Entrega, horários e taxas"
        icon="settings"
        onPress={() => router.push('/dashboard/seller-settings')}
      />

      <DashboardActionItem
        title="Endereço do negócio"
        subtitle="Localização da loja"
        icon="location"
        onPress={() => router.push('/dashboard/business-address')}
      />
    </Screen>
  )
}
