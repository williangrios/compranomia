// app/notifications/[id].tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { Icon, IconName } from '@/components/ui/Icon'
import { colors } from '@/theme'
import {
  notificationService,
  type NotificationItem,
} from '@/services/notification.service'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@wrcb/cb-common'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function subjectLabel(subject: string): {
  label: string
  icon: IconName
  color: string
} {
  switch (subject) {
    case 'OrderCreated':
      return {
        label: 'Novo pedido',
        icon: 'ShoppingCart',
        color: colors.primary,
      }
    case 'OrderStatusChanged':
      return { label: 'Status atualizado', icon: 'RefreshCw', color: '#F59E0B' }
    case 'OrderMessageSent':
      return { label: 'Nova mensagem', icon: 'MessageCircle', color: '#8B5CF6' }
    default:
      return { label: 'Notificação', icon: 'Bell', color: colors.textSecondary }
  }
}

export default function NotificationDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [notification, setNotification] = useState<NotificationItem | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchNotification() {
      try {
        const { notification } = await notificationService.getById(id)
        setNotification(notification)
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotification()
  }, [id])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={screenOptions(router)} />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !notification) {
    return (
      <>
        <Stack.Screen options={screenOptions(router)} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Icon icon="AlertCircle" size={64} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Notificação não encontrada
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  paddingHorizontal: 40,
                }}
              >
                Ela pode ter sido removida ou você não tem acesso.
              </Text>
            </View>
          </ScrollView>
        </View>
      </>
    )
  }

  // ── Detalhe ───────────────────────────────────────────────────────────────
  const { label, icon, color } = subjectLabel(notification.subject)
  const orderId = notification.subjectId

  function goto(destinationRole: UserRole) {
    let routeToGo: string | null = null
    if (destinationRole === UserRole.Consumer) {
      routeToGo = `/(tabs)/orders/${orderId}`
    } else if (destinationRole === UserRole.Seller) {
      routeToGo = `/(tabs)/sales/${orderId}`
    }
    if (!routeToGo) return
    router.dismissAll()
    router.navigate(routeToGo)
  }

  return (
    <>
      <Stack.Screen options={screenOptions(router)} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Badge do tipo */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                backgroundColor: color + '15',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 6,
              }}
            >
              <Icon icon={icon} size={16} color={color} />
              <Text style={{ fontSize: 13, fontWeight: '600', color }}>
                {label}
              </Text>
            </View>
          </View>

          {/* Título */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.textPrimary,
              paddingHorizontal: 16,
              marginBottom: 8,
            }}
          >
            {notification.title}
          </Text>

          {/* Data */}
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              paddingHorizontal: 16,
              marginBottom: 20,
            }}
          >
            {formatDate(notification.createdAt)}
          </Text>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginHorizontal: 16,
              marginBottom: 20,
            }}
          />

          {/* Mensagem */}
          <Text
            style={{
              fontSize: 16,
              color: colors.textPrimary,
              paddingHorizontal: 16,
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            {notification.message}
          </Text>

          {/* Botão Ver Pedido — aparece quando há subjectId */}
          {orderId && (
            <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
                onPress={() => goto(notification.destinationRole)}
                activeOpacity={0.7}
              >
                <Icon icon="ShoppingCart" size={20} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.primary,
                  }}
                >
                  Ver Pedido
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  )
}

// ── Screen options ────────────────────────────────────────────────────────────
function screenOptions(router: ReturnType<typeof useRouter>) {
  return {
    title: 'Ler notificação',
    headerShown: true,
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' as const },
    headerLeft: () => (
      <Pressable
        onPress={() => router.back()}
        style={{ paddingHorizontal: 12 }}
        hitSlop={10}
      >
        <Icon icon="ArrowLeft" size={22} color="#FFFFFF" />
      </Pressable>
    ),
  }
}
