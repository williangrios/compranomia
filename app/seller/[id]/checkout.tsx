import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Icon, IconName } from '@/components/ui/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PaymentMethod } from '@wrcb/cb-common'
import { useCart, CartItem } from '@/contexts/CartContext'
import { useAddress } from '@/contexts/AddressContext'
import { sellerService } from '@/services/seller.service'
import { orderService } from '@/services/order.service'
import { colors, spacing } from '@/theme'
import { DEFAULT_IMAGE } from '@/utils/constants'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { ApiError } from '@/types'
import { getApiErrors } from '@/utils/getApiErrors'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

// ─── Payment Labels ───────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; icon: string }> = {
  [PaymentMethod.Pix]: { label: 'Pix', icon: 'QrCode' },
  [PaymentMethod.Cash]: { label: 'Dinheiro', icon: 'Banknote' },
  [PaymentMethod.CreditCard]: {
    label: 'Cartão de Crédito',
    icon: 'CreditCard',
  },
  [PaymentMethod.DebitCard]: { label: 'Cartão de Débito', icon: 'CreditCard' },
  [PaymentMethod.MealCard]: { label: 'Vale Refeição', icon: 'Utensils' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Checkout() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { getCart, getCartSubtotal, clearCart, updateQuantity, removeItem } =
    useCart()
  const { address, coordinates } = useAddress()

  const cart = getCart(id!)
  const subtotal = getCartSubtotal(id!)

  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    PaymentMethod[]
  >([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  )
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [deliveryTime, setDeliveryTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [observations, setObservations] = useState('')
  const [needsChange, setNeedsChange] = useState(false)
  const [changeAmount, setChangeAmount] = useState('')
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)

  // Carregar dados do seller
  useEffect(() => {
    async function loadSellerData() {
      if (!id || !coordinates) return
      try {
        const profile = await sellerService.getSellerProfile(id)

        // Payment methods
        const methods = (profile as any).acceptedPaymentMethods || []
        setAcceptedPaymentMethods(methods)
        if (methods.length === 1) setSelectedPayment(methods[0])

        // Calcular delivery fee baseado na distância
        // Simplificado: usa o primeiro range que cobre
        if (profile.delivery.ranges.length > 0) {
          // TODO: calcular distância real — por agora usa primeiro range
          const range = profile.delivery.ranges[0]
          setDeliveryFee(range.fee)
          setDeliveryTime(range.averageDeliveryTime)

          // Frete grátis se subtotal >= freeAbove
          if (range.freeAbove > 0 && subtotal >= range.freeAbove) {
            setDeliveryFee(0)
          }
        }
      } catch (error) {
        console.error('[CHECKOUT] Error loading seller data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSellerData()
  }, [id, coordinates, subtotal])

  const total = subtotal + deliveryFee
  function buildObservations(): string {
    const parts: string[] = []

    // Primeiro o troco
    if (selectedPayment === PaymentMethod.Cash && needsChange && changeAmount) {
      parts.push(`Troco para: R$ ${parseFloat(changeAmount).toFixed(2)}`)
    }

    // Depois as observações do usuário
    if (observations.trim()) parts.push(observations.trim())

    return parts.join('. ')
  }

  // ─── Estimativa de entrega ────────────────────────────────────────────────

  function getEstimatedDeliveryDate(): Date {
    const now = new Date()
    now.setMinutes(now.getMinutes() + deliveryTime + 30) // delivery + preparo estimado
    return now
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setApiErrors(null)
    if (!cart || cart.items.length === 0) return
    if (!selectedPayment) {
      Alert.alert('Ooops..', 'Selecione uma forma de pagamento')
      return
    }
    if (!address || !coordinates) {
      Alert.alert('Ooops..', 'Selecione um endereço de entrega')
      return
    }

    Alert.alert(
      'Confirmar Pedido',
      `Total: R$ ${total.toFixed(2)}\nPagamento: ${PAYMENT_LABELS[selectedPayment].label}\n\nConfirma o pedido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setIsSubmitting(true)

              const payload = {
                sellerId: id!,
                deliveryAddress: {
                  label: address.label || 'Casa',
                  cep: address.cep,
                  street: address.street,
                  number: address.number,
                  complement: address.complement || '',
                  neighborhood: address.neighborhood,
                  city: address.city,
                  state: address.state,
                  reference: address.reference || '',
                  deliveryInstructions: '',
                  location: {
                    coordinates: [coordinates.lng, coordinates.lat] as [
                      number,
                      number,
                    ],
                  },
                },
                items: cart.items.map((item) => ({
                  sellerProductId: item.sellerProductId,
                  quantity: item.quantity,
                  price: item.price,
                  promotionalPrice: item.promotionalPrice ?? null,
                })),
                subtotal,
                deliveryFee,
                total,
                paymentMethod: selectedPayment,
                estimatedDeliveryDate: getEstimatedDeliveryDate().toISOString(),
                observations: buildObservations(),
              }
              const { order } = await orderService.createOrder(payload)

              clearCart(id!)

              Alert.alert(
                'Pedido Realizado!',
                'Seu pedido foi enviado ao vendedor.',
                [
                  {
                    text: 'Ver Pedido',
                    onPress: () => {
                      router.dismissAll()
                      router.push('/orders')
                    },
                  },
                ],
              )
            } catch (error: any) {
              setApiErrors(getApiErrors(error))
              // const errorKey =
              //   error.normalizedErrors?.[0]?.message || 'GenericError'
              // const msg = translateError(errorKey)
              // Alert.alert('Ooops..', msg)
            } finally {
              setIsSubmitting(false)
            }
          },
        },
      ],
    )
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  // ─── Carrinho vazio ───────────────────────────────────────────────────────

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Icon icon="ArrowLeft" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Carrinho</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.emptyContainer}>
          <Icon icon="ShoppingCart" size={64} color={colors.textSecondary} />
          <Text style={s.emptyText}>Seu carrinho está vazio</Text>
          <TouchableOpacity style={s.emptyButton} onPress={() => router.back()}>
            <Text style={s.emptyButtonText}>Voltar à loja</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Icon icon="ArrowLeft" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Carrinho</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Seller info */}
        <View style={s.sellerRow}>
          <Image
            source={{ uri: cart.sellerPhoto || DEFAULT_IMAGE }}
            style={s.sellerPhoto}
          />
          <Text style={s.sellerName}>
            {capitalizeFullName(cart.sellerName)}
          </Text>
        </View>

        {/* Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Itens ({cart.items.length})</Text>
          {cart.items.map((item) => (
            <CartItemRow
              key={item.sellerProductId}
              item={item}
              onUpdateQuantity={(qty) =>
                updateQuantity(id!, item.sellerProductId, qty)
              }
              onRemove={() => removeItem(id!, item.sellerProductId)}
            />
          ))}
        </View>

        {/* Endereço */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Endereço de entrega</Text>
          {address ? (
            <View style={s.addressRow}>
              <Icon icon="MapPin" size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.addressMain}>
                  {address.street}, {address.number}
                </Text>
                <Text style={s.addressSecondary}>
                  {address.neighborhood} - {address.city}/{address.state}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={s.warningText}>Selecione um endereço</Text>
          )}
          {/* Tempo estimado */}
          {deliveryTime > 0 && (
            <View style={s.deliveryTimeRow}>
              <Icon icon="Clock" size={18} color={colors.textSecondary} />
              <Text style={s.deliveryTimeText}>
                Entrega estimada: {deliveryTime} min
              </Text>
            </View>
          )}
        </View>

        {/* Forma de pagamento */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Forma de pagamento</Text>
          <Text style={s.paymentHint}>Pagamento na entrega</Text>
          {acceptedPaymentMethods.map((method) => {
            const info = PAYMENT_LABELS[method]
            const isSelected = selectedPayment === method
            return (
              <TouchableOpacity
                key={method}
                style={[s.paymentOption, isSelected && s.paymentOptionActive]}
                onPress={() => setSelectedPayment(method)}
                activeOpacity={0.7}
              >
                <Icon
                  icon={info.icon as IconName}
                  size={22}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[s.paymentLabel, isSelected && s.paymentLabelActive]}
                >
                  {info.label}
                </Text>
                <Icon
                  icon={isSelected ? 'CircleDot' : 'Circle'}
                  size={22}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Troco — só aparece se pagamento for Dinheiro */}
        {selectedPayment === PaymentMethod.Cash && (
          <View style={s.changeContainer}>
            <TouchableOpacity
              style={s.changeRow}
              onPress={() => {
                setNeedsChange(!needsChange)
                if (needsChange) setChangeAmount('')
              }}
              activeOpacity={0.7}
            >
              <Icon
                icon={needsChange ? 'SquareCheck' : 'Square'}
                size={22}
                color={colors.primary}
              />
              <Text style={s.changeLabel}>Precisa de troco?</Text>
            </TouchableOpacity>

            {needsChange && (
              <View style={s.changeInputRow}>
                <Text style={s.changeInputLabel}>Troco para quanto?</Text>
                <TextInput
                  style={s.changeInput}
                  placeholder="Ex: 50"
                  placeholderTextColor={colors.textSecondary}
                  value={changeAmount}
                  onChangeText={(text) =>
                    setChangeAmount(text.replace(',', '.'))
                  }
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            )}
          </View>
        )}
        {/* Observações */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Observações</Text>
          <TextInput
            style={s.observationsInput}
            placeholder="Alguma instrução para o vendedor? (opcional)"
            placeholderTextColor={colors.textSecondary}
            value={observations}
            onChangeText={setObservations}
            multiline
            maxLength={5000}
            numberOfLines={3}
          />
        </View>

        {/* Resumo */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Resumo</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Taxa de entrega</Text>
            <Text
              style={[
                s.summaryValue,
                deliveryFee === 0 && { color: colors.success },
              ]}
            >
              {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          <View style={[s.summaryRow, s.summaryTotal]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      {/* Bottom bar */}
      {/* Bottom bar */}
      <View
        style={[
          s.bottomBar,
          {
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <ErrorMessage errors={apiErrors} />
        <View style={s.bottomBarRow}>
          <View>
            <Text style={s.bottomTotal}>R$ {total.toFixed(2)}</Text>
            <Text style={s.bottomItems}>{cart.items.length} item(ns)</Text>
          </View>
          <TouchableOpacity
            style={[s.submitButton, isSubmitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={s.submitButtonText}>Finalizar Compra</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  onUpdateQuantity: (qty: number) => void
  onRemove: () => void
}) {
  const hasPromo =
    item.promotionalPrice != null && item.promotionalPrice < item.price
  const displayPrice = hasPromo ? item.promotionalPrice! : item.price
  const itemTotal = displayPrice * (item.quantity / item.step)

  return (
    <View style={s.cartItem}>
      <Image
        source={{ uri: item.image || DEFAULT_IMAGE }}
        style={s.cartItemImage}
      />
      <View style={s.cartItemBody}>
        <Text style={s.cartItemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={s.cartItemPrice}>R$ {displayPrice.toFixed(2)}</Text>

        <View style={s.cartItemFooter}>
          <View style={s.quantityRow}>
            <TouchableOpacity
              style={s.quantityButton}
              onPress={() => {
                const nextQty = item.quantity - item.step
                if (nextQty <= 0) {
                  onRemove()
                } else {
                  onUpdateQuantity(nextQty)
                }
              }}
            >
              <Icon
                icon={item.quantity <= item.step ? 'Trash2' : 'Minus'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            <Text style={s.quantityText}>
              {' '}
              {item.quantity} {item.measurementUnit}
            </Text>
            <TouchableOpacity
              style={s.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity + item.step)}
            >
              <Icon icon="Plus" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={s.cartItemTotal}>R$ {itemTotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sellerPhoto: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  cartItemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  cartItemBody: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cartItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  cartItemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressMain: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addressSecondary: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
  },
  paymentHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    gap: 12,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  paymentLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  paymentLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 12,
    paddingVertical: 6,
  },
  deliveryTimeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomItems: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  changeContainer: {
    marginTop: 12,
    paddingHorizontal: 18,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  changeLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  changeInputRow: {
    marginTop: 12,
    gap: 6,
  },
  changeInputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  changeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
})
