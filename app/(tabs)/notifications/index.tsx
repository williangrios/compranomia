// app/notifications.tsx
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, components } from '@/theme'
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem'
import {
  notificationService,
  type NotificationItem,
} from '@/services/notification.service'
import { useNotifications } from '@/contexts/NotificationContext'
import { Screen } from '@/components/layout/Screen'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMinutes < 1) return 'Agora mesmo'
  if (diffMinutes < 60) return `${diffMinutes} min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`

  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

const PAGE_SIZE = 20

export default function Notifications() {
  const router = useRouter()
  const { refreshUnread } = useNotifications()

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchNotifications = useCallback(
    async (pageNum: number, append: boolean) => {
      try {
        if (pageNum === 1) setIsLoading(true)
        else setIsLoadingMore(true)

        const { notifications: items } =
          await notificationService.getNotifications(pageNum)
        setNotifications((prev) => (append ? [...prev, ...items] : items))
        setHasMore(items.length === PAGE_SIZE)
      } catch {
        // silenciar
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [],
  )

  // Busca inicial
  useEffect(() => {
    fetchNotifications(1, false)
  }, [fetchNotifications])

  // Atualiza badge ao sair da tela
  useEffect(() => {
    return () => {
      refreshUnread()
    }
  }, [refreshUnread])

  // Marca como lido
  async function handlePress(notification: NotificationItem) {
    if (!notification.isRead) {
      notificationService.markAsRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      )
    }
    router.push(`/notifications/${notification.id}`)
  }

  // Carrega próxima página
  function handleLoadMore() {
    if (!hasMore || isLoadingMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage, true)
  }

  // ── Loading inicial ───────────────────────────────────────────────────────
  if (isLoading && notifications.length === 0) {
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

  // ── Empty state ───────────────────────────────────────────────────────────
  if (notifications.length === 0) {
    return (
      <>
        <Stack.Screen options={screenOptions(router)} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons
                name="notifications-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Nenhuma notificação
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  paddingHorizontal: 40,
                }}
              >
                Quando houver novidades, promoções ou atualizações importantes,
                elas aparecerão aqui.
              </Text>
            </View>
          </ScrollView>
        </View>
      </>
    )
  }

  // ── Lista ─────────────────────────────────────────────────────────────────
  return (
    <Screen>
      <Stack.Screen options={screenOptions(router)} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <View key={notification.id} style={{ flexDirection: 'row' }}>
              {/* Faixa indicadora não lido */}
              <View
                style={{
                  width: 4,
                  backgroundColor: notification.isRead
                    ? 'transparent'
                    : colors.primary,
                }}
              />

              <View style={{ flex: 1 }}>
                <ProfileMenuItem
                  title={notification.title}
                  subtitle={`${notification.message} ${formatDate(notification.createdAt)}`}
                  showBadge={!notification.isRead}
                  onPress={() => handlePress(notification)}
                />
              </View>
            </View>
          ))}

          {/* Botão carregar mais */}
          {hasMore && (
            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 16,
                marginVertical: 8,
              }}
              onPress={handleLoadMore}
              disabled={isLoadingMore}
              activeOpacity={0.6}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.primary,
                  }}
                >
                  Carregar mais
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Screen>
  )
}

// ── Screen options ────────────────────────────────────────────────────────────
function screenOptions(router: ReturnType<typeof useRouter>) {
  return {
    title: 'Notificações',
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
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>
    ),
  }
}
