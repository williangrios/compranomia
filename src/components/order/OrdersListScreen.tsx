import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/theme'
import { OrderStatus } from '@wrcb/cb-common'
import { orderService } from '@/services/order.service'
import { orderStyles as s } from '@/styles/orders.styles'

interface OrderItem {
  name: string
  quantity: number
  measurementUnit: string
  subtotal: number
}

interface Order {
  id: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  createdAt: string
  wasRated: boolean
  sellerId?: {
    id: string
    nickName: string
  }
  customerId?: {
    id?: string
    nickName?: string
    name?: string
  }
}

interface Props {
  type: 'orders' | 'sales'
  onViewOrder: (id: string) => void
  onOpenChat: (id: string) => void
  getDisplayName: (order: Order) => string
  emptyTitle: string
  emptySubtitle: string
  emptyIcon: keyof typeof Ionicons.glyphMap
  onRateOrder?: (orderId: string, sellerId: string, sellerName: string) => void
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  [OrderStatus.Pending]: {
    label: 'Pendente',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: 'time-outline',
  },
  [OrderStatus.Confirmed]: {
    label: 'Confirmado',
    color: '#2563EB',
    bg: '#DBEAFE',
    icon: 'checkmark-circle-outline',
  },
  [OrderStatus.Preparing]: {
    label: 'Preparando',
    color: '#7C3AED',
    bg: '#EDE9FE',
    icon: 'restaurant-outline',
  },
  [OrderStatus.Delivering]: {
    label: 'A caminho',
    color: '#0891B2',
    bg: '#CFFAFE',
    icon: 'bicycle-outline',
  },
  [OrderStatus.Delivered]: {
    label: 'Entregue',
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: 'checkmark-done-outline',
  },
  [OrderStatus.Cancelled]: {
    label: 'Cancelado',
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: 'close-circle-outline',
  },
}

const FILTER_CHIPS = [
  { label: 'Todos', value: null },
  { label: 'Pendentes', value: OrderStatus.Pending },
  { label: 'Confirmados', value: OrderStatus.Confirmed },
  { label: 'Preparando', value: OrderStatus.Preparing },
  { label: 'A caminho', value: OrderStatus.Delivering },
  { label: 'Entregues', value: OrderStatus.Delivered },
  { label: 'Cancelados', value: OrderStatus.Cancelled },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export function OrdersListScreen({
  onViewOrder,
  onOpenChat,
  getDisplayName,
  emptyTitle,
  type,
  onRateOrder,
  emptySubtitle,
  emptyIcon,
}: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const LIMIT = 20

  const loadOrders = useCallback(
    async (status: OrderStatus | null, skip = 0, append = false) => {
      try {
        const params: any = {
          limit: LIMIT,
          skip,
          mode: type === 'orders' ? 'purchase' : 'sale',
        }

        if (status) params.status = status

        const data = await orderService.getOrders(params)

        if (append) {
          setOrders((prev) => {
            const newItems = data.orders.filter(
              (o: Order) => !prev.some((p) => p.id === o.id),
            )
            return [...prev, ...newItems]
          })
        } else {
          setOrders(data.orders)
        }

        setTotal(data.total)
      } catch (error) {
        console.error('[ORDERS LIST] Error loading:', error)
      }
    },
    [type],
  )

  useEffect(() => {
    setIsLoading(true)
    loadOrders(selectedStatus, 0, false).finally(() => setIsLoading(false))
  }, [selectedStatus, loadOrders])

  async function handleRefresh() {
    setIsRefreshing(true)
    await loadOrders(selectedStatus)
    setIsRefreshing(false)
  }

  async function handleLoadMore() {
    if (isLoadingMore || orders.length >= total) return
    setIsLoadingMore(true)
    await loadOrders(selectedStatus, orders.length, true)
    setIsLoadingMore(false)
  }

  function handleFilterChange(status: OrderStatus | null) {
    if (status === selectedStatus) return
    setOrders([])
    setTotal(0)
    setSelectedStatus(status)
  }

  function renderOrder({ item }: { item: Order }) {
    const config = STATUS_CONFIG[item.status]

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.sellerName}>{getDisplayName(item)}</Text>
            <Text style={s.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>

          <View style={[s.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons
              name={config.icon as any}
              size={13}
              color={config.color}
            />
            <Text style={[s.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <Text style={s.itemsSummary} numberOfLines={2}>
          {item.items.map((i) => i.name).join(', ')}
        </Text>

        <View style={s.cardFooter}>
          <Text style={s.itemsCount}>{item.items.length} item(ns)</Text>
          <Text style={s.total}>R$ {item.total.toFixed(2)}</Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity
            style={s.actionButton}
            onPress={() => onViewOrder(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={16} color={colors.primary} />
            <Text style={s.actionButtonText}>Ver pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionButton, s.actionButtonChat]}
            onPress={() => onOpenChat(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={colors.textInverse}
            />
            <Text style={[s.actionButtonText, { color: colors.textInverse }]}>
              Chat
            </Text>
          </TouchableOpacity>

          {item.status === OrderStatus.Delivered && type === 'orders' && (
            <TouchableOpacity
              style={[s.actionButton, item.wasRated && s.actionButtonDisabled]}
              onPress={() => {
                if (!item.wasRated && item.sellerId) {
                  onRateOrder?.(
                    item.id,
                    item.sellerId.id,
                    item.sellerId.nickName,
                  )
                }
              }}
              disabled={item.wasRated}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.wasRated ? 'checkmark-circle' : 'star'}
                size={16}
                color={item.wasRated ? colors.textSecondary : colors.primary}
              />
              <Text
                style={[
                  s.actionButtonText,
                  item.wasRated && s.actionButtonTextDisabled,
                ]}
              >
                {item.wasRated ? 'Avaliado' : 'Avaliar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <FlatList
        data={FILTER_CHIPS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.label}
        contentContainerStyle={s.chipsContainer}
        renderItem={({ item }) => {
          const isActive = selectedStatus === item.value
          return (
            <TouchableOpacity
              style={[s.chip, isActive && s.chipActive]}
              onPress={() =>
                handleFilterChange(item.value as OrderStatus | null)
              }
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, isActive && s.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        }}
        style={s.chipsRow}
      />

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Ionicons
                name={emptyIcon}
                size={64}
                color={colors.textSecondary}
              />
              <Text style={s.emptyTitle}>{emptyTitle}</Text>
              <Text style={s.emptySubtitle}>{emptySubtitle}</Text>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ paddingVertical: spacing.md }}
              />
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      )}
    </View>
  )
}
