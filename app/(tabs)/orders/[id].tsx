// app/(tabs)/orders/[id].tsx
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { IconName } from '@/components/ui/Icon'
import { Icon } from '@/components/ui/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { OrderStatus, PaymentMethod } from '@wrcb/cb-common'
import { orderService } from '@/services/order.service'
import { colors, spacing } from '@/theme'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { translateError } from '@/utils/errorMessages'
import { Screen } from '@/components/layout/Screen'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string
  price: number
  promotionalPrice?: number | null
  barcode?: string
  quantity: number
  measurementUnit: string
  subtotal: number
}

interface Order {
  id: string
  status: OrderStatus
  items: OrderItem[]
  deliveryAddress: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    cep: string
    deliveryInstructions?: string
  }
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  estimatedDeliveryDate: string
  observations: string
  createdAt: string
  sellerId?: { nickName: string; name: string }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  [OrderStatus.Pending]: {
    label: 'Pendente',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: 'Clock',
  },
  [OrderStatus.Confirmed]: {
    label: 'Confirmado',
    color: '#2563EB',
    bg: '#DBEAFE',
    icon: 'CheckCircle',
  },
  [OrderStatus.Preparing]: {
    label: 'Preparando',
    color: '#7C3AED',
    bg: '#EDE9FE',
    icon: 'ChefHat',
  },
  [OrderStatus.Delivering]: {
    label: 'A caminho',
    color: '#0891B2',
    bg: '#CFFAFE',
    icon: 'Bike',
  },
  [OrderStatus.Delivered]: {
    label: 'Entregue',
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: 'CheckCheck',
  },
  [OrderStatus.Cancelled]: {
    label: 'Cancelado',
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: 'XCircle',
  },
}

const PAYMENT_LABELS: Record<string, string> = {
  [PaymentMethod.Pix]: 'Pix',
  [PaymentMethod.Cash]: 'Dinheiro',
  [PaymentMethod.CreditCard]: 'Cartão de Crédito',
  [PaymentMethod.DebitCard]: 'Cartão de Débito',
  [PaymentMethod.MealCard]: 'Vale Refeição',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false)

  const loadOrder = useCallback(async () => {
    try {
      const data = await orderService.getOrder(id!)

      setOrder(data.order)
    } catch (error) {
      console.error('[ORDER DETAIL] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  async function handleCancel() {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true)
              await orderService.cancelOrder(id!, 'Cancelado pelo cliente')
              await loadOrder()
            } catch (error: any) {
              const key = error.normalizedErrors?.[0]?.message || 'GenericError'
              Alert.alert('Erro', translateError(key))
            } finally {
              setIsCancelling(false)
            }
          },
        },
      ],
    )
  }

  async function handleConfirmDelivery() {
    Alert.alert('Confirmar entrega', 'Confirma que recebeu o pedido?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, recebi',
        onPress: async () => {
          try {
            setIsConfirmingDelivery(true)
            await orderService.updateStatus(id!, OrderStatus.Delivered)
            await loadOrder()
          } catch (error: any) {
            const key = error.normalizedErrors?.[0]?.message || 'GenericError'
            Alert.alert('Erro', translateError(key))
          } finally {
            setIsConfirmingDelivery(false)
          }
        },
      },
    ])
  }

  if (isLoading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Icon icon="ArrowLeft" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  if (!order) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Icon icon="ArrowLeft" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>
            Pedido não encontrado
          </Text>
        </View>
      </View>
    )
  }

  const config = STATUS_CONFIG[order.status]
  const canCancel = [OrderStatus.Pending, OrderStatus.Confirmed].includes(
    order.status,
  )
  const canConfirmDelivery =
    order.status !== OrderStatus.Delivered &&
    order.status !== OrderStatus.Cancelled

  return (
    <Screen>
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/orders')}
            hitSlop={10}
          >
            <Icon icon="ArrowLeft" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Detalhes do Pedido</Text>
          {/* Botão chat */}
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/orders/${id}/chat`)}
            hitSlop={10}
          >
            <Icon icon="MessageCircle" size={28} color={colors.success} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Status */}
          <View style={s.section}>
            <View style={s.statusRow}>
              <View style={[s.statusBadge, { backgroundColor: config.bg }]}>
                <Icon
                  icon={config.icon as IconName}
                  size={16}
                  color={config.color}
                />
                <Text style={[s.statusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
              <Text style={s.dateText}>{formatDateTime(order.createdAt)}</Text>
            </View>
            {order.sellerId?.nickName && (
              <Text style={s.sellerName}>
                Vendedor: {capitalizeFullName(order.sellerId.nickName)}
              </Text>
            )}
            <View style={s.estimatedRow}>
              <Icon icon="Clock" size={15} color={colors.textSecondary} />
              <Text style={s.estimatedText}>
                Previsão: {formatDateTime(order.estimatedDeliveryDate)}
              </Text>
            </View>
          </View>

          {/* Itens */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Itens ({order.items.length})</Text>
            {order.items.map((item, idx) => {
              const effectivePrice =
                item.promotionalPrice != null &&
                item.promotionalPrice < item.price
                  ? item.promotionalPrice
                  : item.price
              return (
                <View key={idx} style={s.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemMeta}>
                      {item.quantity} {item.measurementUnit} × R${' '}
                      {effectivePrice.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={s.itemSubtotal}>
                    R$ {item.subtotal.toFixed(2)}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Endereço */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Endereço de entrega</Text>
            <View style={s.addressRow}>
              <Icon icon="MapPin" size={18} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={s.addressMain}>
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                  {order.deliveryAddress.complement
                    ? ` - ${order.deliveryAddress.complement}`
                    : ''}
                </Text>
                <Text style={s.addressSecondary}>
                  {order.deliveryAddress.neighborhood} —{' '}
                  {order.deliveryAddress.city}/{order.deliveryAddress.state}
                </Text>
                <Text style={s.addressSecondary}>
                  CEP: {order.deliveryAddress.cep}
                </Text>
                {order.deliveryAddress.deliveryInstructions ? (
                  <Text style={s.addressSecondary}>
                    Obs: {order.deliveryAddress.deliveryInstructions}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Pagamento */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pagamento</Text>
            <View style={s.paymentRow}>
              <Icon icon="CreditCard" size={18} color={colors.textSecondary} />
              <Text style={s.paymentText}>
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </Text>
              <Text style={s.paymentHint}>(na entrega)</Text>
            </View>
          </View>

          {/* Observações */}
          {order.observations && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Observações</Text>
              <View style={s.addressRow}>
                <Icon icon="AlertCircle" size={18} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={s.addressSecondary}>{order.observations}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Resumo financeiro */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Resumo</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryValue}>R$ {order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Taxa de entrega</Text>
              <Text
                style={[
                  s.summaryValue,
                  order.deliveryFee === 0 && { color: colors.success },
                ]}
              >
                {order.deliveryFee === 0
                  ? 'Grátis'
                  : `R$ ${order.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={[s.summaryRow, s.summaryTotal]}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>R$ {order.total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom actions */}
        <View
          style={[s.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}
        >
          {canConfirmDelivery && (
            <TouchableOpacity
              style={[
                s.confirmButton,
                isConfirmingDelivery && { opacity: 0.6 },
              ]}
              onPress={handleConfirmDelivery}
              disabled={isConfirmingDelivery}
              activeOpacity={0.8}
            >
              {isConfirmingDelivery ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon icon="CheckCheck" size={18} color="#FFF" />
                  <Text style={s.confirmButtonText}>Confirmar recebimento</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[s.cancelButton, isCancelling && { opacity: 0.6 }]}
              onPress={handleCancel}
              disabled={isCancelling}
              activeOpacity={0.8}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.error} size="small" />
              ) : (
                <>
                  <Icon icon="XCircle" size={18} color={colors.error} />
                  <Text style={s.cancelButtonText}>Cancelar pedido</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Screen>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontWeight: '700' },
  dateText: { fontSize: 12, color: colors.textSecondary },
  sellerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  estimatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  estimatedText: { fontSize: 13, color: colors.textSecondary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  itemMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressMain: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  addressSecondary: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  paymentText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  paymentHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, color: colors.textPrimary },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: { color: colors.error, fontSize: 15, fontWeight: '600' },
})
