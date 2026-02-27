import { useState, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { compressImage } from '@/utils/image/imageCompression.helper'
import { Screen } from '@/components/layout/Screen'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { colors, components } from '@/theme'
import { productEnrichmentService } from '@/services/productEnrichment.service'
import { sellerProductService } from '@/services/sellerProduct.service'
import { productStyles as styles } from '@/styles/product.styles'
import { MeasurementUnit, TenantDataService, UserTags } from '@wrcb/cb-common'
import { PHARMACY_TAGS } from '@/utils/constants'
import { sortByLabel, userTagsLabels } from '@/utils/enumLabels/userTags.labels'
import { getApiErrors } from '@/utils/getApiErrors'
import { formatters } from '@/utils/formatters'
import { useAuth } from '@/contexts/AuthContext'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  image?: string
  name?: string
  description?: string
  productCategory?: string
  measurementUnit?: string
  price?: string
  stock?: string
  step?: string
  sellerSpotlighted?: string
  isProhibitedForMinors?: string
  isPrescriptionRequired?: string
  promotionalPrice?: string
}

interface ProductForm {
  name: string
  description: string
  brand: string
  productCategory: UserTags | ''
  measurementUnit: MeasurementUnit
  baseWeight: string
  step: string
  price: string
  stock: string
  minStockAlert: string
  sellerSpotlighted: boolean
  isProhibitedForMinors: boolean
  isPrescriptionRequired: boolean
  promotionalPrice: string
}

export default function NewProduct() {
  const router = useRouter()
  const { barcode: routeBarcode } = useLocalSearchParams<{ barcode?: string }>()

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const hasEnrichedRef = useRef(false)
  const { user } = useAuth()

  const sortedTags = useMemo(() => {
    if (!user) return []

    const allowed = TenantDataService.getTagsForCategory(
      user.tenant,
      user.category,
    ) as UserTags[]

    return sortByLabel(allowed, userTagsLabels)
  }, [user])

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    brand: '',
    productCategory: '',
    measurementUnit: MeasurementUnit.Un,
    baseWeight: '',
    step: '1',
    price: '',
    sellerSpotlighted: false,
    isProhibitedForMinors: false,
    isPrescriptionRequired: false,
    stock: '0',
    minStockAlert: '',
    promotionalPrice: '',
  })

  const isUnit = form.measurementUnit === MeasurementUnit.Un
  const [hasPromotion, setHasPromotion] = useState(false)
  const [showPrescriptionToggle, setShowPrescriptionToggle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)

  useEffect(() => {
    if (form.measurementUnit !== MeasurementUnit.Un) {
      setForm((prev) => ({
        ...prev,
        baseWeight: prev.step,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        step: '1',
      }))
    }
  }, [form.measurementUnit])

  function setField<K extends keyof ProductForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setApiErrors(null)
    setSuccess(null)
  }

  // ═══════════════════════════════════════
  // IMAGEM
  // ═══════════════════════════════════════

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) return

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 })
    if (result.canceled) return

    const normalized = await compressImage(result.assets[0])
    setImage(normalized)
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
    if (result.canceled) return

    const normalized = await compressImage(result.assets[0])
    setImage(normalized)
  }

  function removeImage() {
    setImage(null)
    hasEnrichedRef.current = false
  }

  // ═══════════════════════════════════════
  // IA (uso único)
  // ═══════════════════════════════════════

  async function handleEnrichFromImage() {
    if (!image || hasEnrichedRef.current) {
      return
    }

    try {
      setIsEnriching(true)
      setApiErrors(null)
      setSuccess(null)
      const enriched = await productEnrichmentService.enrich(image)
      hasEnrichedRef.current = true

      const isPharmacy =
        enriched.productCategory &&
        PHARMACY_TAGS.includes(enriched.productCategory as UserTags)

      setShowPrescriptionToggle(!!isPharmacy)

      setForm((prev) => ({
        ...prev,
        name: enriched.name ?? prev.name,
        description: enriched.description ?? prev.description,
        brand: enriched.brand ?? prev.brand,
        productCategory:
          (enriched.productCategory as UserTags) ?? prev.productCategory,
        measurementUnit:
          (enriched.measurementUnit as MeasurementUnit) ?? prev.measurementUnit,
        baseWeight: enriched.baseWeight
          ? String(enriched.baseWeight)
          : prev.baseWeight,
        isPrescriptionRequired: isPharmacy
          ? !!enriched.requiresPrescription
          : false,
        isProhibitedForMinors: !!enriched.restrictedToAdults,
      }))

      setSuccess({ message: 'Dados preenchidos automaticamente pela IA' })
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsEnriching(false)
    }
  }

  // ═══════════════════════════════════════
  // VALIDAÇÃO
  // ═══════════════════════════════════════

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!image) {
      newErrors.image = 'Selecione uma imagem para o produto'
    }

    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!form.description.trim())
      newErrors.description = 'Descrição é obrigatória'
    if (!form.productCategory)
      newErrors.productCategory = 'Categoria é obrigatória'
    if (!form.measurementUnit)
      newErrors.measurementUnit = 'Unidade é obrigatória'

    const price = parseFloat(form.price)
    if (!form.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    }

    const stock = parseInt(form.stock)
    if (form.stock === '' || isNaN(stock) || stock < 0) {
      newErrors.stock = 'Estoque não pode ser negativo'
    }

    const step = parseFloat(form.step)
    if (!form.step || isNaN(step) || step <= 0) {
      newErrors.step = 'Incremento deve ser maior que zero'
    }

    if (hasPromotion && form.promotionalPrice) {
      const promo = parseFloat(form.promotionalPrice)
      if (isNaN(promo) || promo <= 0) {
        newErrors.promotionalPrice = 'Preço promocional deve ser maior que zero'
      } else if (promo >= price) {
        newErrors.promotionalPrice =
          'Preço promocional deve ser menor que o preço normal'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ═══════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════

  async function handleSubmit() {
    if (!validate()) return

    try {
      setIsSubmitting(true)
      setApiErrors(null)
      setSuccess(null)

      await sellerProductService.create({
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        productCategory: form.productCategory,
        measurementUnit: form.measurementUnit,
        baseWeight: Number(form.baseWeight),
        step: Number(form.step),
        price: Number(form.price),
        stock: Number(form.stock),
        minStockAlert: form.minStockAlert
          ? Number(form.minStockAlert)
          : undefined,
        promotionalPrice:
          hasPromotion && form.promotionalPrice
            ? Number(form.promotionalPrice)
            : undefined,
        barcode: routeBarcode || undefined,
        images: image ? [{ uri: image.uri }] : [],
        sellerSpotlighted: Boolean(form.sellerSpotlighted),
        isProhibitedForMinors: Boolean(form.isProhibitedForMinors),
        isPrescriptionRequired: Boolean(form.isPrescriptionRequired),
      })

      setSuccess({ message: 'Produto criado com sucesso' })
      setTimeout(() => router.replace('/dashboard/products/'), 800)
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <Screen>
      {/* Imagem */}
      <View style={styles.fieldWrapper}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: '50%', aspectRatio: 3 / 4 }}>
            {image ? (
              <View style={{ flex: 1 }}>
                <Image
                  source={{ uri: image.uri }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={removeImage}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  components.input.container,
                  { flex: 1, justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Nenhuma imagem
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
            <TouchableOpacity
              style={components.auth.buttonSecondary}
              onPress={pickFromCamera}
            >
              <Text style={components.auth.buttonTextSecondary}>Câmera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={components.auth.buttonSecondary}
              onPress={pickFromGallery}
            >
              <Text style={components.auth.buttonTextSecondary}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>
        {errors.image && (
          <Text style={components.auth.errorText}>{errors.image}</Text>
        )}
      </View>

      {/* IA */}
      {(!hasEnrichedRef.current || isEnriching) && (
        <View style={styles.fieldWrapper}>
          <TouchableOpacity
            style={[
              components.auth.buttonSecondary,
              hasEnrichedRef.current && components.button.disabled,
            ]}
            onPress={handleEnrichFromImage}
            disabled={!image || isEnriching || hasEnrichedRef.current}
            activeOpacity={0.8}
          >
            {isEnriching ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text
                style={[
                  components.auth.buttonTextSecondary,
                  hasEnrichedRef.current && { color: colors.disabled },
                ]}
              >
                Preencher com IA
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Código de barras (read-only se veio da rota) */}
      {routeBarcode && (
        <View style={styles.fieldWrapper}>
          <Text style={components.input.label}>Código de barras</Text>
          <TextInput
            style={[
              components.input.container,
              components.input.text,
              { backgroundColor: colors.surface },
            ]}
            value={routeBarcode}
            editable={false}
          />
        </View>
      )}

      {/* Nome */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Nome *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.name && components.input.error,
          ]}
          value={form.name}
          onChangeText={(v) => setField('name', v)}
          placeholder="Nome do produto"
          placeholderTextColor={colors.textSecondary}
        />
        {errors.name && (
          <Text style={components.auth.errorText}>{errors.name}</Text>
        )}
      </View>

      {/* Descrição */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Descrição *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.description && components.input.error,
          ]}
          value={form.description}
          onChangeText={(v) => setField('description', v)}
          placeholder="Capriche na descrição do produto"
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        {errors.description && (
          <Text style={components.auth.errorText}>{errors.description}</Text>
        )}
      </View>

      {/* Marca */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Marca</Text>
        <TextInput
          style={[components.input.container, components.input.text]}
          value={form.brand}
          onChangeText={(v) => setField('brand', v)}
          placeholder="Marca do produto"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Categoria */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Categoria *</Text>
        <View
          style={[
            styles.pickerContainer,
            errors.productCategory && { borderColor: '#FF4D4F' },
          ]}
        >
          <Picker<UserTags | undefined>
            style={{
              color: '#111111',
              backgroundColor: '#FFFFFF',
            }}
            mode="dropdown"
            dropdownIconColor="#111111"
            selectedValue={
              form.productCategory ? form.productCategory : undefined
            }
            onValueChange={(v) => {
              setForm((prev) => ({
                ...prev,
                productCategory: v ?? '',
              }))

              setErrors((prev) => ({
                ...prev,
                productCategory: undefined,
              }))

              if (v && PHARMACY_TAGS.includes(v)) {
                setShowPrescriptionToggle(true)
              } else {
                setShowPrescriptionToggle(false)
                setForm((prev) => ({
                  ...prev,
                  isPrescriptionRequired: false,
                }))
              }
            }}
          >
            <Picker.Item label="Selecione" value={undefined} color="#111111" />
            {sortedTags.map((tag) => (
              <Picker.Item
                key={tag}
                value={tag}
                label={userTagsLabels[tag] ?? tag}
                color="#111111"
              />
            ))}
          </Picker>
        </View>
        {errors.productCategory && (
          <Text style={components.auth.errorText}>
            {errors.productCategory}
          </Text>
        )}
      </View>

      {/* Unidade de medida */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Unidade de medida *</Text>
        <View
          style={[
            components.input.container,
            { padding: 0 },
            errors.measurementUnit && components.input.error,
          ]}
        >
          <Picker<MeasurementUnit>
            style={{
              color: '#111111',
              backgroundColor: '#FFFFFF',
            }}
            mode="dropdown"
            dropdownIconColor="#111111"
            selectedValue={form.measurementUnit}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, measurementUnit: v }))
            }
          >
            {Object.values(MeasurementUnit).map((u) => (
              <Picker.Item key={u} label={u} value={u} color="#111111" />
            ))}
          </Picker>
        </View>
        {errors.measurementUnit && (
          <Text style={components.auth.errorText}>
            {errors.measurementUnit}
          </Text>
        )}
      </View>

      {/* Peso / Volume */}
      {isUnit && (
        <View style={styles.fieldWrapper}>
          <Text style={components.input.label}>Peso / Volume</Text>
          <TextInput
            style={[components.input.container, components.input.text]}
            value={form.baseWeight}
            editable={isUnit}
            onChangeText={(v) => setField('baseWeight', v)}
            placeholder="Ex: 500"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      {/* Step / Incremento */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>
          Incremento por clique ({form.measurementUnit || 'Un'}) *
        </Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.step && components.input.error,
          ]}
          value={form.step}
          editable={!isUnit}
          onChangeText={(v) => setField('step', v)}
          keyboardType="numeric"
        />
        <Text style={styles.hintText}>
          {formatters.instructionsHowToBuy(
            form.measurementUnit,
            Number(form.step),
          )}
        </Text>
        {errors.step && (
          <Text style={components.auth.errorText}>{errors.step}</Text>
        )}
      </View>

      {/* Preço */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>
          Preço a cada {form.step} {form.measurementUnit} (R$) *
        </Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.price && components.input.error,
          ]}
          value={form.price}
          onChangeText={(v) => setField('price', v)}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor={colors.textSecondary}
        />
        {errors.price && (
          <Text style={components.auth.errorText}>{errors.price}</Text>
        )}
      </View>

      {/* Promoção */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Colocar em promoção</Text>
        <Switch
          value={hasPromotion}
          onValueChange={(v) => {
            setHasPromotion(v)
            if (!v) {
              setForm((prev) => ({ ...prev, promotionalPrice: '' }))
              setErrors((prev) => ({ ...prev, promotionalPrice: undefined }))
            }
          }}
        />
      </View>

      {hasPromotion && (
        <View style={styles.fieldWrapper}>
          <Text
            style={components.input.label}
          >{`Preço promocional a cada ${form.step} ${form.measurementUnit} (R$) *`}</Text>
          <TextInput
            style={[
              components.input.container,
              components.input.text,
              errors.promotionalPrice && components.input.error,
            ]}
            value={form.promotionalPrice}
            onChangeText={(v) => setField('promotionalPrice', v)}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          {form.price && form.promotionalPrice && (
            <Text style={styles.hintText}>
              Desconto de{' '}
              {(
                ((parseFloat(form.price) - parseFloat(form.promotionalPrice)) /
                  parseFloat(form.price)) *
                100
              ).toFixed(0)}
              %
            </Text>
          )}
          {errors.promotionalPrice && (
            <Text style={components.auth.errorText}>
              {errors.promotionalPrice}
            </Text>
          )}
        </View>
      )}

      {/* Flags */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Destacar produto</Text>
        <Switch
          value={form.sellerSpotlighted}
          onValueChange={(v) =>
            setForm((prev) => ({ ...prev, sellerSpotlighted: v }))
          }
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Proibida venda para menores</Text>
        <Switch
          value={form.isProhibitedForMinors}
          onValueChange={(v) =>
            setForm((prev) => ({ ...prev, isProhibitedForMinors: v }))
          }
        />
      </View>

      {showPrescriptionToggle && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            Exige retenção de receita médica
          </Text>
          <Switch
            value={form.isPrescriptionRequired}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, isPrescriptionRequired: v }))
            }
          />
        </View>
      )}

      <SuccessMessage success={success} />
      <ErrorMessage errors={apiErrors} />

      {/* Submit */}
      <TouchableOpacity
        style={[components.auth.buttonPrimary, { marginTop: 8 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={components.auth.buttonText}>Salvar Produto</Text>
        )}
      </TouchableOpacity>
    </Screen>
  )
}
