// components/modals/LocationPickerModal.tsx
import { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import MapView, {
  Marker,
  Region,
  MapPressEvent,
  MarkerDragEvent, // ✅ CORRIGIDO
  MarkerDragStartEndEvent,
} from 'react-native-maps'
import { Icon } from '@/components/ui/Icon'
import { colors, spacing, components } from '@/theme'

interface LocationPickerModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: (
    coordinates: [number, number],
    address?: { city: string; state: string },
  ) => void
  initialRegion?: {
    latitude: number
    longitude: number
  }
}

export function LocationPickerModal({
  visible,
  onClose,
  onConfirm,
  initialRegion,
}: LocationPickerModalProps) {
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialRegion?.latitude || -20.2933292,
    longitude: initialRegion?.longitude || -45.5301332,
  })

  // ✅ NOVO: Estado para endereço reverso
  const [addressInfo, setAddressInfo] = useState<{
    city: string
    state: string
  } | null>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  useEffect(() => {
    if (initialRegion) {
      setMarkerPosition(initialRegion)
    }
  }, [initialRegion])

  const region: Region = {
    ...markerPosition,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }

  // ✅ NOVO: Reverse geocoding
  async function reverseGeocode(lat: number, lng: number) {
    try {
      setIsLoadingAddress(true)

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
          `lat=${lat}` +
          `&lon=${lng}` +
          `&format=json` +
          `&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'App/1.0',
          },
        },
      )

      const data = await response.json()

      if (data && data.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.municipality ||
          data.address.village ||
          ''

        const state = data.address.state || ''

        if (city && state) {
          setAddressInfo({ city, state })
        } else {
          setAddressInfo(null)
        }
      }
    } catch (error) {
      console.error('❌ Reverse geocode error:', error)
      setAddressInfo(null)
    } finally {
      setIsLoadingAddress(false)
    }
  }

  function handleConfirm() {
    onConfirm(
      [markerPosition.longitude, markerPosition.latitude],
      addressInfo || undefined,
    )
    onClose()
  }

  async function handleMapPress(e: MapPressEvent) {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setMarkerPosition({ latitude, longitude })
    await reverseGeocode(latitude, longitude)
  }

  async function handleMarkerDragEnd(e: MarkerDragStartEndEvent) {
    // ✅ CORRIGIDO
    const { latitude, longitude } = e.nativeEvent.coordinate
    setMarkerPosition({ latitude, longitude })
    await reverseGeocode(latitude, longitude)
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        {/* Mapa */}
        <MapView
          style={{ flex: 1 }}
          initialRegion={region}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        </MapView>

        {/* Controles */}
        <View
          style={{
            backgroundColor: colors.background,
            padding: spacing.md,
            paddingBottom: spacing.xl,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* ✅ NOVO: Mostra cidade/estado */}
          {isLoadingAddress && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                padding: spacing.sm,
                borderRadius: 8,
                marginBottom: spacing.sm,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={{
                  marginLeft: spacing.sm,
                  fontSize: 13,
                  color: colors.textSecondary,
                }}
              >
                Buscando endereço...
              </Text>
            </View>
          )}

          {addressInfo && !isLoadingAddress && (
            <View
              style={{
                backgroundColor: colors.success + '10',
                padding: spacing.sm,
                borderRadius: 8,
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textPrimary,
                  fontWeight: '600',
                }}
              >
                📍 {addressInfo.city} - {addressInfo.state}
              </Text>
            </View>
          )}

          {/* Instrução */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary + '10',
              padding: spacing.sm + spacing.xs,
              borderRadius: 8,
              marginBottom: spacing.md,
            }}
          >
            <Icon icon="Info" size={20} color={colors.primary} />
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: colors.textPrimary,
                marginLeft: spacing.sm,
              }}
            >
              Arraste o pin ou toque no mapa para marcar a localização
            </Text>
          </View>

          {/* Botão Confirmar */}
          <TouchableOpacity
            style={[
              components.auth.buttonPrimary,
              {
                flexDirection: 'row',
                marginBottom: spacing.sm,
              },
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Icon icon="CheckCircle" size={20} color={colors.textInverse} />
            <Text
              style={[components.auth.buttonText, { marginLeft: spacing.sm }]}
            >
              Confirmar Localização
            </Text>
          </TouchableOpacity>

          {/* Botão Cancelar */}
          <TouchableOpacity
            style={[
              components.auth.buttonSecondary,
              {
                backgroundColor: colors.backgroundSecondary,
                borderWidth: 0,
              },
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text
              style={[
                components.auth.buttonTextSecondary,
                { color: colors.textPrimary },
              ]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
