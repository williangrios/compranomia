// app/(tabs)/profile/seller-settings.tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui/Header'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { sellerSettingsService } from '@/services/sellerSettings.service'
import { SellerSettings } from '@/types'
import { colors } from '@/theme'
import { ProfileHeader } from '@/components/ui/ProfileHeader'

interface ApiError {
  message: string
  field?: string
}

export default function SellerSettingsScreen() {
  const router = useRouter()

  const [settings, setSettings] = useState<SellerSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setIsLoading(true)
      setApiErrors(null)

      const { sellerSettings } = await sellerSettingsService.get()
      setSettings(sellerSettings)
    } catch (error: unknown) {
      console.error('Error loading settings:', error)
      if (error instanceof Error) {
        // Se não encontrou, significa que ainda não configurou
        if (error.message === 'SellerSettingsNotFound') {
          setSettings(null)
        } else {
          setApiErrors([{ message: error.message }])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSettings = () => {
    Alert.alert(
      'Configurar',
      'As configurações do vendedor incluem horários de funcionamento, taxas de entrega e tempo de preparo. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            // TODO: Navigate to settings form
            Alert.alert(
              'Em desenvolvimento',
              'Formulário de configurações em breve!',
            )
          },
        },
      ],
    )
  }

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ]
    return days[dayOfWeek]
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProfileHeader title="Configurações" showBack />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ErrorMessage errors={apiErrors} />

        {!settings ? (
          /* No Settings - Call to Action */
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Ionicons name="settings" size={40} color={colors.primary} />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.textPrimary,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Configure seu Negócio
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 24,
                textAlign: 'center',
                paddingHorizontal: 20,
              }}
            >
              Defina horários de funcionamento, taxas de entrega e tempo de
              preparo para começar a vender.
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 32,
                borderRadius: 8,
              }}
              onPress={handleCreateSettings}
            >
              <Text
                style={{
                  color: colors.textInverse,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Configurar Agora
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Has Settings - Display Info */
          <>
            {/* Delivery Ranges */}
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: 12,
                }}
              >
                Taxas de Entrega
              </Text>

              {settings.deliveryRanges.map((range, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    borderBottomWidth:
                      index < settings.deliveryRanges.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.textPrimary }}>
                    {range.minKm}km - {range.maxKm}km
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.primary,
                    }}
                  >
                    R$ {range.fee.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Schedule */}
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: 12,
                }}
              >
                Horário de Funcionamento
              </Text>

              {settings.schedule.map((day) => (
                <View
                  key={day.dayOfWeek}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    borderBottomWidth: day.dayOfWeek < 6 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.textPrimary }}>
                    {getDayName(day.dayOfWeek)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: day.isOpen
                        ? colors.textPrimary
                        : colors.textSecondary,
                    }}
                  >
                    {day.isOpen
                      ? day.periods
                          .map((p) => `${p.openTime} - ${p.closeTime}`)
                          .join(', ')
                      : 'Fechado'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Other Info */}
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Tempo de Preparo:
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}
                >
                  {settings.preparationTime} min
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Horário de Corte:
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}
                >
                  {settings.cutoffTime}
                </Text>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => {
                Alert.alert(
                  'Em desenvolvimento',
                  'Edição de configurações em breve!',
                )
              }}
            >
              <Text
                style={{
                  color: colors.textInverse,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Editar Configurações
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  )
}
