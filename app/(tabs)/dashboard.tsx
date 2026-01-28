// app/(tabs)/dashboard.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { colors } from '@/theme'

export default function Dashboard() {
  const router = useRouter()

  const stats = [
    { icon: 'cart', label: 'Pedidos Hoje', value: '0', color: colors.primary },
    { icon: 'cash', label: 'Vendas Hoje', value: 'R$ 0,00', color: '#10B981' },
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
  ]

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Stats Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
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
                borderRadius: 12,
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
                <Ionicons
                  name={stat.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={stat.color}
                />
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Ações Rápidas
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
            }}
            onPress={() => router.push('/orders')}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="list" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                Ver Todos os Pedidos
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Gerencie seus pedidos
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => {
              // TODO: Navigate to products
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="pricetag" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                Gerenciar Produtos
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Adicione ou edite produtos
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
