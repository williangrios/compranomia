// components/forms/SellerProductForm.tsx
import { useState, useEffect } from 'react'
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
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { colors, components } from '@/theme'
import { sellerProductService } from '@/services/sellerProduct.service'
import { productStyles as styles } from '@/styles/product.styles'
import { getApiErrors } from '@/utils/getApiErrors'
import { MeasurementUnit } from '@wrcb/cb-common'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  price?: string
  stock?: string
  step?: string
  promotionalPrice?: string
}

interface FormData {
  name: string
  description: string
  brand: string
  baseWeight: string
  price: string
  stock: string
  step: string
  minStockAlert: string
  promotionalPrice: string
  measurementUnit: MeasurementUnit
}

interface CatalogData {
  id: string
  name: string
  description: string
  productCategory: string
  measurementUnit?: string
  baseWeight?: number
  step?: number
  brand?: string
  barcode?: string
  originalImages?: string[]
  processedImages?: string[]
}

interface SellerProductFormProps {
  productCatalogId?: string
  sellerProductId?: string
  onSuccess?: () => void
}

const UNIT_TYPES: MeasurementUnit[] = [
  MeasurementUnit.Un,
  MeasurementUnit.Pack,
  MeasurementUnit.Bandeja,
  MeasurementUnit.Pct,
]

const DEFAULT_IMAGE = 'https://static.compranomia.com/defaults/product.png'

export function SellerProductForm({
  productCatalogId,
  sellerProductId,
  onSuccess,
}: SellerProductFormProps) {
  const isEditMode = !!sellerProductId
  const isAdoptMode = !!productCatalogId && !sellerProductId

  const [catalog, setCatalog] = useState<CatalogData | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPromotion, setHasPromotion] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    brand: '',
    baseWeight: '',
    price: '',
    stock: '0',
    step: '1',
    minStockAlert: '0',
    promotionalPrice: '',
    measurementUnit: MeasurementUnit.Un,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)

  useEffect(() => {
    if (isEditMode && sellerProductId) {
      loadSellerProduct(sellerProductId)
    } else if (isAdoptMode && productCatalogId) {
      loadCatalogForAdopt(productCatalogId)
    }
  }, [sellerProductId, productCatalogId])

  async function loadSellerProduct(id: string) {
    try {
      setIsFetching(true)
      setApiErrors(null)

      const response = await sellerProductService.getById(id)
      const sp = response?.data?.sellerProduct

      if (!sp) return

      setCatalog(sp.productCatalog ?? null)

      setForm({
        name: sp.name || '',
        description: sp.description || '',
        brand: sp.brand || '',
        baseWeight: sp.baseWeight ? String(sp.baseWeight) : '',
        price: String(sp.price),
        stock: String(sp.stock),
        step: String(sp.step ?? 1),
        minStockAlert: sp.minStockAlert ? String(sp.minStockAlert) : '',
        promotionalPrice: sp.promotionalPrice
          ? String(sp.promotionalPrice)
          : '',
        measurementUnit:
          (sp.measurementUnit as MeasurementUnit) ?? MeasurementUnit.Un,
      })

      if (sp.promotionalPrice && sp.promotionalPrice < sp.price) {
        setHasPromotion(true)
      }
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsFetching(false)
    }
  }

  async function loadCatalogForAdopt(catalogId: string) {
    try {
      setIsFetching(true)
      setApiErrors(null)

      const response = await sellerProductService.getCatalogById(catalogId)
      const cat = response?.data?.productCatalog

      if (!cat) return

      setCatalog(cat)

      setForm((prev) => ({
        ...prev,
        name: cat.name || '',
        description: cat.description || '',
        brand: cat.brand || '',
        baseWeight: cat.baseWeight ? String(cat.baseWeight) : '',
        step: String(cat.step ?? 1),
        measurementUnit:
          (cat.measurementUnit as MeasurementUnit) ?? MeasurementUnit.Un,
      }))
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsFetching(false)
    }
  }

  function setField<K extends keyof FormData>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setApiErrors(null)
    setSuccess(null)
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}

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

  async function handleSubmit() {
    if (!validate()) return

    try {
      setIsSubmitting(true)
      setApiErrors(null)
      setSuccess(null)

      const promoPrice =
        hasPromotion && form.promotionalPrice
          ? parseFloat(form.promotionalPrice)
          : null

      if (isEditMode && sellerProductId) {
        await sellerProductService.update(sellerProductId, {
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          step: parseFloat(form.step),
          minStockAlert: form.minStockAlert
            ? parseInt(form.minStockAlert)
            : undefined,
          promotionalPrice: promoPrice,
          name: form.name.trim() || undefined,
          description: form.description.trim() || undefined,
          brand: form.brand.trim() || undefined,
          baseWeight: form.baseWeight ? parseFloat(form.baseWeight) : undefined,
        })
        setSuccess({ message: 'Produto atualizado com sucesso' })
      } else if (isAdoptMode && productCatalogId) {
        await sellerProductService.adopt({
          productCatalogId,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          step: parseFloat(form.step),
          minStockAlert: form.minStockAlert
            ? parseInt(form.minStockAlert)
            : undefined,
          promotionalPrice: promoPrice,
        })
        setSuccess({ message: 'Produto adotado com sucesso' })
      }

      if (onSuccess) {
        setTimeout(onSuccess, 800)
      }
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getImageUri(): string {
    if (!catalog) return DEFAULT_IMAGE
    const images = catalog.processedImages?.length
      ? catalog.processedImages
      : catalog.originalImages
    return images?.[0] ?? DEFAULT_IMAGE
  }

  function isUnitBased(): boolean {
    return UNIT_TYPES.includes(form.measurementUnit)
  }

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <>
      {/* Produto info (read-only) */}
      {catalog && (
        <View style={[components.card.container, styles.fieldWrapper]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: getImageUri() }}
              style={styles.searchResultImage}
            />
            <View style={styles.searchResultInfo}>
              <Text style={styles.searchResultName} numberOfLines={2}>
                {catalog.name}
              </Text>
              {catalog.brand && (
                <Text style={styles.searchResultBrand}>{catalog.brand}</Text>
              )}
              {catalog.barcode && (
                <Text style={styles.searchResultCategory}>
                  Cód: {catalog.barcode}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {(isEditMode || isAdoptMode) && (
        <>
          <View style={styles.fieldWrapper}>
            <Text style={components.input.label}>Nome</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="Nome do produto"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={components.input.label}>Descrição</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={form.description}
              onChangeText={(v) => setField('description', v)}
              placeholder="Descrição do produto"
              multiline
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={components.input.label}>Marca</Text>
            <TextInput
              style={[components.input.container, components.input.text]}
              value={form.brand}
              onChangeText={(v) => setField('brand', v)}
              placeholder="Marca do produto"
            />
          </View>

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
        </>
      )}

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

      {/* Alerta de estoque mínimo */}
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

      {/* Unidade de medida */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Unidade de medida</Text>
        <View style={[components.input.container, { padding: 0 }]}>
          <Picker<MeasurementUnit>
            selectedValue={form.measurementUnit}
            onValueChange={(v) => {
              setForm((prev) => ({
                ...prev,
                measurementUnit: v,
                step: UNIT_TYPES.includes(v) ? '1' : prev.step,
              }))
            }}
          >
            {Object.values(MeasurementUnit).map((u) => (
              <Picker.Item key={u} label={u} value={u} />
            ))}
          </Picker>
        </View>
        {catalog?.barcode && (
          <Text style={styles.hintText}>
            Produtos com código de barras geralmente são vendidos por unidade
          </Text>
        )}
      </View>

      {/* Step / Incremento */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>
          Incremento por clique ({form.measurementUnit}) *
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
          <Text style={components.auth.buttonText}>
            {isEditMode ? 'Salvar Alterações' : 'Adotar Produto'}
          </Text>
        )}
      </TouchableOpacity>
    </>
  )
}
