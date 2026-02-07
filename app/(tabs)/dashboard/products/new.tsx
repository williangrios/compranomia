import { useState, useRef } from 'react'
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
import { MeasurementUnit, UserTags } from '@wrcb/cb-common'
import { COMPRANOMIA_TAGS, PHARMACY_TAGS } from '@/utils/constants'
import { sortByLabel, userTagsLabels } from '@/utils/enumLabels/userTags.labels'
import { getApiErrors } from '@/utils/getApiErrors'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  name?: string
  description?: string
  productCategory?: string
  measurementUnit?: string
  price?: string
  stock?: string
  step?: string
  promotionalPrice?: string
}

interface ProductForm {
  name: string
  description: string
  brand: string
  productCategory: UserTags | ''
  measurementUnit: MeasurementUnit | ''
  baseWeight: string
  step: string
  price: string
  stock: string
  minStockAlert: string
  promotionalPrice: string
}

const UNIT_TYPES: MeasurementUnit[] = [
  MeasurementUnit.Un,
  MeasurementUnit.Pack,
  MeasurementUnit.Bandeja,
  MeasurementUnit.Pct,
]

export default function NewProduct() {
  const router = useRouter()
  const { barcode: routeBarcode } = useLocalSearchParams<{ barcode?: string }>()
  const sortedTags = sortByLabel(COMPRANOMIA_TAGS, userTagsLabels)

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const hasEnrichedRef = useRef(false)

  const [form, setForm] = useState<ProductForm>({
    name: 'nome',
    description: 'descricao',
    brand: 'marca',
    productCategory: '',
    measurementUnit: '',
    baseWeight: '50',
    step: '1',
    price: '52',
    stock: '0',
    minStockAlert: '',
    promotionalPrice: '',
  })

  const [hasPromotion, setHasPromotion] = useState(false)
  const [restrictedToAdults, setRestrictedToAdults] = useState(false)
  const [requiresPrescription, setRequiresPrescription] = useState(false)
  const [showPrescriptionToggle, setShowPrescriptionToggle] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)

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
    if (!image || hasEnrichedRef.current) return

    try {
      setIsEnriching(true)
      setApiErrors(null)
      setSuccess(null)

      const enriched = await productEnrichmentService.enrich(image)
      hasEnrichedRef.current = true

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
      }))

      if (
        enriched.productCategory &&
        PHARMACY_TAGS.includes(enriched.productCategory as UserTags)
      ) {
        setShowPrescriptionToggle(true)
        setRequiresPrescription(!!enriched.requiresPrescription)
      } else {
        setShowPrescriptionToggle(false)
        setRequiresPrescription(false)
      }

      setRestrictedToAdults(!!enriched.restrictedToAdults)
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
    console.log(
      '[NEW PRODUCT] payload::::::::::::::::::::::::::::::::::::::::::',
      {
        name: form.name.trim(),
        description: form.description.trim(),
        productCategory: form.productCategory,
        measurementUnit: form.measurementUnit,
        price: Number(form.price),
        stock: Number(form.stock),
        hasImage: !!image,
      },
    )
    try {
      setIsSubmitting(true)
      setApiErrors(null)
      setSuccess(null)

      await sellerProductService.create({
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        productCategory: form.productCategory || undefined,
        measurementUnit: form.measurementUnit || undefined,
        baseWeight: form.baseWeight ? Number(form.baseWeight) : undefined,
        step: form.step ? Number(form.step) : undefined,
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
  // HELPERS
  // ═══════════════════════════════════════

  function isUnitBased(): boolean {
    return UNIT_TYPES.includes(form.measurementUnit as MeasurementUnit)
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
                  style={styles.scannerCloseButton}
                >
                  <Text style={{ color: '#fff' }}>✕</Text>
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
          placeholder="Descreva o produto"
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
        />
      </View>

      {/* Categoria */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Categoria *</Text>
        <View
          style={[
            components.input.container,
            { padding: 0 },
            errors.productCategory && components.input.error,
          ]}
        >
          <Picker<UserTags>
            selectedValue={form.productCategory || undefined}
            onValueChange={(v) => {
              setForm((prev) => ({ ...prev, productCategory: v }))
              setErrors((prev) => ({ ...prev, productCategory: undefined }))
              if (v && PHARMACY_TAGS.includes(v)) {
                setShowPrescriptionToggle(true)
              } else {
                setShowPrescriptionToggle(false)
                setRequiresPrescription(false)
              }
            }}
          >
            <Picker.Item label="Selecione" value={undefined} />
            {sortedTags.map((tag) => (
              <Picker.Item
                key={tag}
                value={tag}
                label={userTagsLabels[tag] ?? tag}
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
            selectedValue={form.measurementUnit || undefined}
            onValueChange={(v) => {
              setForm((prev) => ({
                ...prev,
                measurementUnit: v,
                step: UNIT_TYPES.includes(v) ? '1' : prev.step,
              }))
              setErrors((prev) => ({ ...prev, measurementUnit: undefined }))
            }}
          >
            <Picker.Item label="Selecione" value={undefined} />
            {Object.values(MeasurementUnit).map((u) => (
              <Picker.Item key={u} label={u} value={u} />
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
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Peso / Volume</Text>
        <TextInput
          style={[components.input.container, components.input.text]}
          value={form.baseWeight}
          onChangeText={(v) => setField('baseWeight', v)}
          placeholder="Ex: 500"
          keyboardType="numeric"
        />
      </View>

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
          onChangeText={(v) => setField('step', v)}
          placeholder="1"
          keyboardType="numeric"
        />
        <Text style={styles.hintText}>
          {isUnitBased()
            ? 'Cada clique no "+" adiciona essa quantidade ao carrinho'
            : `Ex: se colocar 100, o cliente comprará de 100 em 100 ${form.measurementUnit}`}
        </Text>
        {errors.step && (
          <Text style={components.auth.errorText}>{errors.step}</Text>
        )}
      </View>

      {/* Preço */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Preço (R$) *</Text>
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
          <Text style={components.input.label}>Preço promocional (R$) *</Text>
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

      {/* Estoque */}
      {/* <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Estoque *</Text>
        <TextInput
          style={[
            components.input.container,
            components.input.text,
            errors.stock && components.input.error,
          ]}
          value={form.stock}
          onChangeText={(v) => setField('stock', v)}
          placeholder="0"
          keyboardType="number-pad"
        />
        {errors.stock && (
          <Text style={components.auth.errorText}>{errors.stock}</Text>
        )}
      </View> */}

      {/* Alerta estoque mínimo */}
      {/* <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>
          Alerta de estoque mínimo (opcional)
        </Text>
        <TextInput
          style={[components.input.container, components.input.text]}
          value={form.minStockAlert}
          onChangeText={(v) => setField('minStockAlert', v)}
          placeholder="Ex: 5"
          keyboardType="number-pad"
        />
        <Text style={styles.hintText}>
          Você será notificado quando o estoque atingir esse valor
        </Text>
      </View> */}

      {/* Flags */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Venda proibida para menores</Text>
        <Switch
          value={restrictedToAdults}
          onValueChange={setRestrictedToAdults}
        />
      </View>

      {showPrescriptionToggle && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Exige receita médica</Text>
          <Switch
            value={requiresPrescription}
            onValueChange={setRequiresPrescription}
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
