import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { CameraView } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/layout/Screen'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { colors, components } from '@/theme'
import { sellerProductService } from '@/services/sellerProduct.service'
import { productStyles as styles } from '@/styles/product.styles'
import { getApiErrors } from '@/utils/getApiErrors'

type Step = 'choice' | 'scanner' | 'typeBarcode'

interface ApiError {
  message: string
  field?: string
}

export default function AddProduct() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('choice')
  const [barcode, setBarcode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const scannedRef = useRef(false)

  async function handleBarcodeDetected(code: string) {
    if (scannedRef.current) return
    scannedRef.current = true

    setBarcode(code)
    await searchByBarcode(code)
  }

  async function handleTypedBarcode() {
    const trimmed = barcode.trim()
    if (!trimmed) return
    await searchByBarcode(trimmed)
  }

  async function searchByBarcode(code: string) {
    try {
      setIsSearching(true)
      setApiErrors(null)

      const response = await sellerProductService.searchCatalog(code)
      const products = response?.data?.products ?? []

      if (products.length > 0) {
        const catalog = products[0]
        router.replace({
          pathname: '/dashboard/products/adopt',
          params: {
            productCatalogId: catalog.id,
            barcode: code,
          },
        })
      } else {
        router.replace({
          pathname: '/dashboard/products/new',
          params: { barcode: code },
        })
      }
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
      scannedRef.current = false
    } finally {
      setIsSearching(false)
    }
  }

  function handleNoBarcode() {
    router.push('/dashboard/products/search')
  }

  // ═══════════════════════════════════════
  // SCANNER
  // ═══════════════════════════════════════
  if (step === 'scanner') {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scannerCamera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
          }}
          onBarcodeScanned={({ data }) => handleBarcodeDetected(data)}
        >
          <View style={styles.scannerOverlay}>
            {/* Top bar */}
            <View style={styles.scannerTopBar}>
              <TouchableOpacity
                style={styles.scannerCloseButton}
                onPress={() => {
                  scannedRef.current = false
                  setStep('choice')
                }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scannerTypeButton}
                onPress={() => {
                  scannedRef.current = false
                  setStep('typeBarcode')
                }}
              >
                <Text style={styles.scannerTypeText}>Digitar código</Text>
              </TouchableOpacity>
            </View>

            {/* Guide frame */}
            <View style={styles.scannerGuide}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerHint}>
                Aponte para o código de barras
              </Text>
            </View>

            {/* Bottom */}
            <View style={styles.scannerBottomBar}>
              {isSearching && (
                <ActivityIndicator size="large" color={colors.primary} />
              )}
            </View>
          </View>
        </CameraView>
      </View>
    )
  }

  // ═══════════════════════════════════════
  // DIGITAR CÓDIGO DE BARRAS
  // ═══════════════════════════════════════
  if (step === 'typeBarcode') {
    return (
      <Screen>
        <View style={styles.barcodeInputContainer}>
          <Text style={styles.barcodeInputTitle}>
            Digite o código de barras
          </Text>

          <View style={styles.fieldWrapper}>
            <Text style={components.input.label}>Código de barras</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={barcode}
              onChangeText={(v) => {
                setBarcode(v)
                setApiErrors(null)
              }}
              placeholder="Ex: 7891234567890"
              keyboardType="number-pad"
              autoFocus
            />
          </View>

          <ErrorMessage errors={apiErrors} />

          <TouchableOpacity
            style={components.auth.buttonPrimary}
            onPress={handleTypedBarcode}
            disabled={isSearching || !barcode.trim()}
            activeOpacity={0.8}
          >
            {isSearching ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={components.auth.buttonText}>Buscar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[components.auth.buttonSecondary, { marginTop: 12 }]}
            onPress={() => {
              setBarcode('')
              setApiErrors(null)
              setStep('scanner')
            }}
            activeOpacity={0.8}
          >
            <Text style={components.auth.buttonTextSecondary}>
              Voltar ao scanner
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  // ═══════════════════════════════════════
  // MODAL DE ESCOLHA (step === 'choice')
  // ═══════════════════════════════════════
  return (
    <View style={styles.loadingContainer}>
      <Modal transparent animationType="fade" visible>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Produto</Text>
            <Text style={styles.modalSubtitle}>
              O produto tem código de barras?
            </Text>

            <View style={styles.modalButtonGap}>
              <TouchableOpacity
                style={components.auth.buttonPrimary}
                onPress={() => setStep('scanner')}
                activeOpacity={0.8}
              >
                <Text style={components.auth.buttonText}>
                  Sim, escanear código
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={components.auth.buttonSecondary}
                onPress={handleNoBarcode}
                activeOpacity={0.8}
              >
                <Text style={components.auth.buttonTextSecondary}>
                  Não tem código de barras
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={components.auth.buttonSecondary}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={components.auth.buttonTextSecondary}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
