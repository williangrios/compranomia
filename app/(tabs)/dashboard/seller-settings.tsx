'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/layout/Screen'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { sellerSettingsService } from '@/services/sellerSettings.service'
import { colors, components } from '@/theme'
import { getApiErrors } from '@/utils/getApiErrors'
import { userTagsLabels, sortByLabel } from '@/utils/enumLabels/userTags.labels'
import { PaymentMethod, UserTags } from '@wrcb/cb-common'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryRange {
  minKm: number
  maxKm: number
  fee: number
  freeAbove: number
  averageDeliveryTime: number
}

interface TimePeriod {
  openTime: string
  closeTime: string
}

interface ScheduleDay {
  dayOfWeek: number
  isOpen: boolean
  periods: TimePeriod[]
  cutoffTime?: string // "HH:MM" — por dia
}

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  deliveryRanges?: {
    [index: number]: Partial<Record<keyof DeliveryRange, string>>
  }
  schedule?: {
    [index: number]: {
      periods?: { [pIndex: number]: Partial<Record<keyof TimePeriod, string>> }
      cutoffTime?: string
    }
  }
  preparationTime?: string
  acceptedPaymentMethods?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function emptyRange(): DeliveryRange {
  return { minKm: 0, maxKm: 0, fee: 0, freeAbove: 0, averageDeliveryTime: 0 }
}

function emptySchedule(): ScheduleDay[] {
  return DAY_NAMES.map((_, i) => ({
    dayOfWeek: i,
    isOpen: i >= 1 && i <= 5,
    periods:
      i >= 1 && i <= 5 ? [{ openTime: '08:00', closeTime: '18:00' }] : [],
    cutoffTime: i >= 1 && i <= 5 ? '16:00' : undefined,
  }))
}

function emptyPeriod(): TimePeriod {
  return { openTime: '08:00', closeTime: '18:00' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  return cleaned
}

function formatTime(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return digits.slice(0, 2) + ':' + digits.slice(2)
}

function isValidTime(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RangeField({
  label,
  value,
  onChangeText,
  error,
  helper,
  suffix,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  helper?: string
  suffix?: string
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={components.input.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            error && components.input.error,
            { flex: 1 },
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
        />
        {suffix && (
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }}
          >
            {suffix}
          </Text>
        )}
      </View>
      {helper && (
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
        >
          {helper}
        </Text>
      )}
      {error && <Text style={components.auth.errorText}>{error}</Text>}
    </View>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellerSettings() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [deliveryRanges, setDeliveryRanges] = useState<DeliveryRange[]>([
    emptyRange(),
  ])
  const [schedule, setSchedule] = useState<ScheduleDay[]>(emptySchedule())
  const [preparationTime, setPreparationTime] = useState('30')
  const [sellerActive, setSellerActive] = useState(true)
  const [adminActive, setAdminActive] = useState(true)
  const [tags, setTags] = useState<UserTags[]>([])
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    PaymentMethod[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  // Modal: editar períodos + cutoffTime de um dia
  const [periodsModalDay, setPeriodsModalDay] = useState<number | null>(null)

  const translatedCategories = sortByLabel(tags, userTagsLabels)

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoadingData(true)
        const { sellerSettings } = await sellerSettingsService.getSettings()
        setAdminActive(sellerSettings.adminActive)
        setTags(
          (sellerSettings.tags || []).filter((tag: string): tag is UserTags =>
            Object.values(UserTags).includes(tag as UserTags),
          ),
        )
        if (sellerSettings) {
          setAcceptedPaymentMethods(sellerSettings.acceptedPaymentMethods || [])
          setDeliveryRanges(sellerSettings.deliveryRanges)
          // Garante que cada dia tem cutoffTime (compatibilidade com dados antigos)
          setSchedule(
            sellerSettings.schedule.map((day: ScheduleDay) => ({
              ...day,
              cutoffTime: day.cutoffTime ?? (day.isOpen ? '16:00' : undefined),
            })),
          )
          setPreparationTime(String(sellerSettings.preparationTime))
          setSellerActive(sellerSettings.sellerActive)
        }
      } catch (error) {
        console.log('Sem configurações salvas, usando defaults')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadSettings()
  }, [])

  // ── Helpers de estado ───────────────────────────────────────────────────────
  const clearMessages = useCallback(() => {
    setApiErrors(null)
    setSuccess(null)
  }, [])

  // ── Delivery Ranges ─────────────────────────────────────────────────────────
  function addRange() {
    setDeliveryRanges((prev) => [...prev, emptyRange()])
    clearMessages()
  }

  function removeRange(index: number) {
    setDeliveryRanges((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.deliveryRanges?.[index]
      return next
    })
    clearMessages()
  }

  function updateRange(index: number, field: keyof DeliveryRange, raw: string) {
    const value = formatNumber(raw)
    setDeliveryRanges((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    )
    setErrors((prev) => {
      const rangeErrors = { ...prev.deliveryRanges }
      if (rangeErrors[index]) {
        const { [field]: _, ...rest } = rangeErrors[index]
        rangeErrors[index] = rest
      }
      return { ...prev, deliveryRanges: rangeErrors }
    })
    clearMessages()
  }

  // ── Schedule ────────────────────────────────────────────────────────────────
  function toggleDayOpen(dayIndex: number) {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              isOpen: !day.isOpen,
              periods:
                !day.isOpen && day.periods.length === 0
                  ? [emptyPeriod()]
                  : day.periods,
              // Ao abrir: define cutoffTime default se não tiver; ao fechar: limpa
              cutoffTime: !day.isOpen ? (day.cutoffTime ?? '16:00') : undefined,
            }
          : day,
      ),
    )
    clearMessages()
  }

  function addPeriod(dayIndex: number) {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, periods: [...day.periods, emptyPeriod()] }
          : day,
      ),
    )
  }

  function removePeriod(dayIndex: number, periodIndex: number) {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              periods: day.periods.filter((_, pi) => pi !== periodIndex),
            }
          : day,
      ),
    )
  }

  function updatePeriod(
    dayIndex: number,
    periodIndex: number,
    field: keyof TimePeriod,
    raw: string,
  ) {
    const value = formatTime(raw)
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              periods: day.periods.map((p, pi) =>
                pi === periodIndex ? { ...p, [field]: value } : p,
              ),
            }
          : day,
      ),
    )
  }

  function updateCutoffTime(dayIndex: number, raw: string) {
    const value = formatTime(raw)
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, cutoffTime: value } : day,
      ),
    )
    // Limpa erro de cutoffTime desse dia
    setErrors((prev) => {
      const scheduleErrors = { ...prev.schedule }
      if (scheduleErrors[dayIndex]) {
        const { cutoffTime: _, ...rest } = scheduleErrors[dayIndex]
        scheduleErrors[dayIndex] = rest
      }
      return { ...prev, schedule: scheduleErrors }
    })
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: FormErrors = {}

    // Delivery ranges
    const rangeErrors: FormErrors['deliveryRanges'] = {}
    deliveryRanges.forEach((range, i) => {
      const fieldErrors: Record<string, string> = {}
      const minKm = parseFloat(range.minKm as any)
      const maxKm = parseFloat(range.maxKm as any)
      const fee = parseFloat(range.fee as any)
      const freeAbove = parseFloat(range.freeAbove as any)
      const avgTime = parseInt(range.averageDeliveryTime as any, 10)

      if (isNaN(minKm)) fieldErrors.minKm = 'Obrigatório'
      if (isNaN(maxKm)) fieldErrors.maxKm = 'Obrigatório'
      else if (maxKm <= minKm) fieldErrors.maxKm = 'Deve ser maior que mín.'
      if (isNaN(fee)) fieldErrors.fee = 'Obrigatório'
      if (isNaN(freeAbove)) fieldErrors.freeAbove = 'Obrigatório'
      if (isNaN(avgTime) || avgTime < 1)
        fieldErrors.averageDeliveryTime = 'Mín. 1 min'

      if (i > 0 && !isNaN(minKm)) {
        const prevMax = parseFloat(deliveryRanges[i - 1].maxKm as any)
        if (!isNaN(prevMax) && minKm < prevMax) {
          fieldErrors.minKm = 'Sobrepõe com range anterior'
        }
      }

      if (Object.keys(fieldErrors).length > 0) rangeErrors[i] = fieldErrors
    })
    if (Object.keys(rangeErrors).length > 0)
      newErrors.deliveryRanges = rangeErrors

    // Schedule — períodos + cutoffTime por dia
    const scheduleErrors: FormErrors['schedule'] = {}
    schedule.forEach((day, i) => {
      if (!day.isOpen) return

      const dayErrors: FormErrors['schedule'] extends infer T
        ? T extends Record<number, infer V>
          ? V
          : never
        : never = {} as any

      // Validar períodos
      const periodErrors: Record<
        number,
        Partial<Record<keyof TimePeriod, string>>
      > = {}
      day.periods.forEach((p, pi) => {
        const pErrors: Record<string, string> = {}
        if (!isValidTime(p.openTime)) pErrors.openTime = 'Horário inválido'
        if (!isValidTime(p.closeTime)) pErrors.closeTime = 'Horário inválido'
        if (Object.keys(pErrors).length > 0) periodErrors[pi] = pErrors
      })
      if (Object.keys(periodErrors).length > 0)
        (dayErrors as any).periods = periodErrors

      // Validar cutoffTime do dia
      if (!day.cutoffTime || !isValidTime(day.cutoffTime)) {
        ;(dayErrors as any).cutoffTime = 'Formato inválido (HH:MM)'
      }

      if (Object.keys(dayErrors).length > 0) scheduleErrors[i] = dayErrors
    })
    if (Object.keys(scheduleErrors).length > 0)
      newErrors.schedule = scheduleErrors

    // preparationTime
    const prep = parseInt(preparationTime, 10)
    if (isNaN(prep) || prep < 0) newErrors.preparationTime = 'Deve ser ≥ 0'

    if (acceptedPaymentMethods.length === 0) {
      // pode usar um novo campo em FormErrors ou simplesmente um alert
      newErrors.acceptedPaymentMethods =
        'Selecione pelo menos uma forma de pagamento'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    clearMessages()
    if (!validate()) return

    try {
      setIsLoading(true)

      const payload = {
        deliveryRanges: deliveryRanges.map((r) => ({
          minKm: parseFloat(r.minKm as any),
          maxKm: parseFloat(r.maxKm as any),
          fee: parseFloat(r.fee as any),
          freeAbove: parseFloat(r.freeAbove as any),
          averageDeliveryTime: parseInt(r.averageDeliveryTime as any, 10),
        })),
        schedule: schedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          periods: day.isOpen ? day.periods : [],
          cutoffTime: day.isOpen ? day.cutoffTime : undefined,
        })),
        preparationTime: parseInt(preparationTime, 10),
        sellerActive,
        acceptedPaymentMethods,
      }

      await sellerSettingsService.upsertSettings(payload)

      setSuccess({ message: 'Configurações salvas com sucesso' })
    } catch (error: any) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoadingData) {
    return (
      <Screen>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
            Carregando configurações...
          </Text>
        </View>
      </Screen>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View
          style={{
            backgroundColor: colors.primary + '10',
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
            🚚 Configure as opções de entrega, horários de funcionamento e
            preferências da sua loja.
          </Text>
        </View>

        {/* ─── ADMIN INACTIVE BANNER ──────────────────────────────────────────── */}
        {!adminActive && (
          <View
            style={{
              backgroundColor: colors.danger + '12',
              borderWidth: 1,
              borderColor: colors.danger + '40',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <Ionicons
              name="warning-outline"
              size={22}
              color={colors.danger}
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.danger,
                  marginBottom: 4,
                }}
              >
                Loja suspensa pela administração
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.danger + 'CC',
                  lineHeight: 18,
                }}
              >
                Sua loja foi desativada pelo administrador da plataforma. Você
                não conseguirá receber pedidos até que o acesso seja reativado.
                Entre em contato com o suporte para mais informações.
              </Text>
            </View>
          </View>
        )}

        {/* ─── DELIVERY RANGES ──────────────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Faixas de Entrega
        </Text>

        {deliveryRanges.map((range, index) => {
          const rangeError = errors.deliveryRanges?.[index] || {}
          return (
            <View
              key={index}
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              {/* Header da faixa */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}
                >
                  Faixa {index + 1}
                </Text>
                {deliveryRanges.length > 1 && (
                  <TouchableOpacity onPress={() => removeRange(index)}>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Row 1: minKm / maxKm */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <RangeField
                  label="Mín. (km)"
                  value={String(range.minKm)}
                  onChangeText={(v) => updateRange(index, 'minKm', v)}
                  error={rangeError.minKm}
                  suffix="km"
                />
                <RangeField
                  label="Máx. (km)"
                  value={String(range.maxKm)}
                  onChangeText={(v) => updateRange(index, 'maxKm', v)}
                  error={rangeError.maxKm}
                  suffix="km"
                />
              </View>

              {/* Row 2: fee / freeAbove */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <RangeField
                  label="Taxa (R$)"
                  value={String(range.fee)}
                  onChangeText={(v) => updateRange(index, 'fee', v)}
                  error={rangeError.fee}
                  suffix="R$"
                />
                <RangeField
                  label="Grátis acima (R$)"
                  value={String(range.freeAbove)}
                  onChangeText={(v) => updateRange(index, 'freeAbove', v)}
                  error={rangeError.freeAbove}
                  suffix="R$"
                />
              </View>

              {/* Row 3: averageDeliveryTime */}
              <RangeField
                label="Tempo médio de entrega"
                value={String(range.averageDeliveryTime)}
                onChangeText={(v) =>
                  updateRange(index, 'averageDeliveryTime', v)
                }
                error={rangeError.averageDeliveryTime}
                helper="Tempo estimado em minutos para essa faixa de distância"
                suffix="min"
              />
            </View>
          )
        })}

        {/* Botão adicionar faixa */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            marginBottom: 24,
          }}
          onPress={addRange}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontSize: 14,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Adicionar área de entrega
          </Text>
        </TouchableOpacity>

        {/* ─── SCHEDULE ─────────────────────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Horários de Funcionamento
        </Text>

        {schedule.map((day, index) => {
          const hasError = errors.schedule?.[index]
          return (
            <View
              key={day.dayOfWeek}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              {/* Nome do dia */}
              <Text
                style={{
                  width: 38,
                  fontSize: 14,
                  fontWeight: '600',
                  color: day.isOpen ? colors.textPrimary : colors.textSecondary,
                }}
              >
                {DAY_NAMES[index]}
              </Text>

              {/* Toggle aberto/fechado */}
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: day.isOpen ? colors.primary : colors.border,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
                onPress={() => toggleDayOpen(index)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.background,
                    alignSelf: day.isOpen ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>

              {/* Períodos ou "Fechado" */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                {!day.isOpen ? (
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Fechado
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => setPeriodsModalDay(index)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: hasError ? colors.danger : colors.primary,
                        fontWeight: '500',
                      }}
                    >
                      {day.periods.length === 0
                        ? 'Adicionar horário'
                        : day.periods
                            .map((p) => `${p.openTime}–${p.closeTime}`)
                            .join(', ')}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={hasError ? colors.danger : colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        })}

        <View style={{ marginBottom: 24 }} />

        {/* ─── PREPARATION TIME ─────────────────────────────────────────────── */}
        <View style={{ marginBottom: 16 }}>
          <Text style={components.input.label}>Tempo de Preparação *</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[
                components.input.container,
                components.input.text,
                errors.preparationTime && components.input.error,
                { flex: 1 },
              ]}
              value={preparationTime}
              onChangeText={(text) => {
                setPreparationTime(text.replace(/\D/g, ''))
                setErrors((prev) => ({ ...prev, preparationTime: undefined }))
                clearMessages()
              }}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor={colors.textSecondary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                marginLeft: 8,
              }}
            >
              min
            </Text>
          </View>
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}
          >
            Tempo médio para preparar o pedido após recebimento
          </Text>
          {errors.preparationTime && (
            <Text style={components.auth.errorText}>
              {errors.preparationTime}
            </Text>
          )}
        </View>

        {/* Tags selecionadas */}
        <Text style={components.input.label}>Seções</Text>
        {translatedCategories.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
            >
              {translatedCategories.map((tag) => (
                <View
                  key={tag}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: colors.primary + '20',
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.primary,
                    }}
                  >
                    {userTagsLabels[tag] || tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.primary,
            }}
          >
            Você ainda não tem produtos à venda
          </Text>
        )}

        {/* ─── FORMAS DE PAGAMENTO ──────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Formas de Pagamento Aceitas
        </Text>

        {[
          {
            key: PaymentMethod.Pix,
            label: 'Pix',
            icon: 'qr-code-outline' as const,
          },
          {
            key: PaymentMethod.Cash,
            label: 'Dinheiro',
            icon: 'cash-outline' as const,
          },
          {
            key: PaymentMethod.CreditCard,
            label: 'Cartão de Crédito',
            icon: 'card-outline' as const,
          },
          // { key: PaymentMethod.DebitCard, label: 'Cartão de Débito', icon: 'card-outline' as const },
          // { key: PaymentMethod.MealCard, label: 'Vale Refeição', icon: 'restaurant-outline' as const },
        ].map((method) => {
          const isSelected = acceptedPaymentMethods.includes(method.key)
          return (
            <TouchableOpacity
              key={method.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => {
                setAcceptedPaymentMethods((prev) =>
                  isSelected
                    ? prev.filter((m) => m !== method.key)
                    : [...prev, method.key],
                )
                clearMessages()
              }}
              activeOpacity={0.7}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <Ionicons
                  name={method.icon}
                  size={22}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: 15,
                    color: isSelected
                      ? colors.textPrimary
                      : colors.textSecondary,
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {method.label}
                </Text>
              </View>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={24}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          )
        })}

        {errors.acceptedPaymentMethods && (
          <Text style={[components.auth.errorText, { marginTop: 8 }]}>
            {errors.acceptedPaymentMethods}
          </Text>
        )}

        <View style={{ marginBottom: 24 }} />

        {/* ─── SELLER ACTIVE TOGGLE ─────────────────────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.backgroundSecondary,
              padding: 16,
              borderRadius: 12,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                Loja Ativa
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {sellerActive
                  ? 'Sua loja está visível para clientes'
                  : 'Sua loja está pausada'}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: sellerActive ? colors.primary : colors.border,
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
              onPress={() => {
                setSellerActive((prev) => !prev)
                clearMessages()
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  alignSelf: sellerActive ? 'flex-end' : 'flex-start',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <SuccessMessage success={success} />
        <ErrorMessage errors={apiErrors} />

        {/* Submit */}
        <TouchableOpacity
          style={[
            components.auth.buttonPrimary,
            { marginBottom: 40 },
            !adminActive && { opacity: 0.4 },
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !adminActive}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={components.auth.buttonText}>Salvar Configurações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ─── MODAL: Períodos + CutoffTime de um dia ─────────────────────────── */}
      <Modal
        visible={periodsModalDay !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPeriodsModalDay(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setPeriodsModalDay(null)}
        >
          <Pressable
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '70%',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                {periodsModalDay !== null ? DAY_NAMES[periodsModalDay] : ''}
              </Text>
              <TouchableOpacity onPress={() => setPeriodsModalDay(null)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={{ padding: 16 }}>
                {/* ── Períodos ── */}
                {periodsModalDay !== null &&
                  schedule[periodsModalDay].periods.map((period, pIndex) => {
                    const periodError =
                      errors.schedule?.[periodsModalDay]?.periods?.[pIndex] ||
                      {}
                    return (
                      <View
                        key={pIndex}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        {/* Abertura */}
                        <View style={{ flex: 1 }}>
                          <Text style={components.input.label}>Abertura</Text>
                          <TextInput
                            style={[
                              components.input.container,
                              components.input.text,
                              periodError.openTime && components.input.error,
                            ]}
                            value={period.openTime}
                            onChangeText={(v) =>
                              updatePeriod(
                                periodsModalDay,
                                pIndex,
                                'openTime',
                                v,
                              )
                            }
                            placeholder="08:00"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="number-pad"
                            maxLength={5}
                          />
                          {periodError.openTime && (
                            <Text style={components.auth.errorText}>
                              {periodError.openTime}
                            </Text>
                          )}
                        </View>

                        {/* Dash */}
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: 18,
                            marginTop: 20,
                          }}
                        >
                          –
                        </Text>

                        {/* Fechamento */}
                        <View style={{ flex: 1 }}>
                          <Text style={components.input.label}>Fechamento</Text>
                          <TextInput
                            style={[
                              components.input.container,
                              components.input.text,
                              periodError.closeTime && components.input.error,
                            ]}
                            value={period.closeTime}
                            onChangeText={(v) =>
                              updatePeriod(
                                periodsModalDay,
                                pIndex,
                                'closeTime',
                                v,
                              )
                            }
                            placeholder="18:00"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="number-pad"
                            maxLength={5}
                          />
                          {periodError.closeTime && (
                            <Text style={components.auth.errorText}>
                              {periodError.closeTime}
                            </Text>
                          )}
                        </View>

                        {/* Remove período */}
                        {schedule[periodsModalDay].periods.length > 1 && (
                          <TouchableOpacity
                            onPress={() =>
                              removePeriod(periodsModalDay, pIndex)
                            }
                            style={{ marginTop: 20 }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color={colors.danger}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    )
                  })}

                {/* Adicionar período */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    marginTop: 8,
                  }}
                  onPress={() =>
                    periodsModalDay !== null && addPeriod(periodsModalDay)
                  }
                >
                  <Ionicons name="add" size={18} color={colors.primary} />
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: '600',
                      marginLeft: 6,
                    }}
                  >
                    Adicionar Período
                  </Text>
                </TouchableOpacity>

                {/* ── Divider ── */}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    marginTop: 20,
                    marginBottom: 16,
                  }}
                />

                {/* ── Cutoff Time do dia ── */}
                {periodsModalDay !== null && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={components.input.label}>
                      Horário de Corte *
                    </Text>
                    <TextInput
                      style={[
                        components.input.container,
                        components.input.text,
                        errors.schedule?.[periodsModalDay]?.cutoffTime &&
                          components.input.error,
                      ]}
                      value={schedule[periodsModalDay].cutoffTime ?? ''}
                      onChangeText={(v) => updateCutoffTime(periodsModalDay, v)}
                      placeholder="16:00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      Pedidos após esse horário neste dia serão processados no
                      dia seguinte
                    </Text>
                    {errors.schedule?.[periodsModalDay]?.cutoffTime && (
                      <Text style={components.auth.errorText}>
                        {errors.schedule[periodsModalDay].cutoffTime}
                      </Text>
                    )}
                  </View>
                )}

                {/* Botão confirmar modal */}
                <TouchableOpacity
                  style={[components.auth.buttonPrimary, { marginTop: 20 }]}
                  onPress={() => setPeriodsModalDay(null)}
                >
                  <Text style={components.auth.buttonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  )
}
