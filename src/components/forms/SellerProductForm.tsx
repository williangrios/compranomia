// components/forms/SellerProductForm.tsx
import { useState, useEffect, useMemo } from 'react'
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
import { MeasurementUnit, TenantDataService, UserTags } from '@wrcb/cb-common'
import { sortByLabel, userTagsLabels } from '@/utils/enumLabels/userTags.labels'
import { DEFAULT_IMAGE, PHARMACY_TAGS } from '@/utils/constants'
import { formatters } from '@/utils/formatters'
import { useAuth } from '@/contexts/AuthContext'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  price?: string
  stock?: string
  step?: string
  sellerSpotlighted?: string
  isProhibitedForMinors?: string
  isPrescriptionRequired?: string
  promotionalPrice?: string
}

interface FormData {
  name: string
  description: string
  brand: string
  baseWeight: string
  productCategory: UserTags | ''
  price: string
  barcode: string
  stock: string
  step: string
  minStockAlert: string
  promotionalPrice: string
  sellerSpotlighted: boolean
  isProhibitedForMinors: boolean
  isPrescriptionRequired: boolean
  measurementUnit: MeasurementUnit
  isActive: boolean
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
  isProhibitedForMinors: boolean
  isPrescriptionRequired: boolean
  originalImages?: string[]
  processedImages?: string[]
}

interface SellerProductFormProps {
  productCatalogId?: string
  sellerProductId?: string
  onSuccess?: () => void
}

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
  const { user } = useAuth()

  const sortedTags = useMemo(() => {
    if (!user) return []

    const allowed = TenantDataService.getTagsForCategory(
      user.tenant,
      user.category,
    ) as UserTags[]

    return sortByLabel(allowed, userTagsLabels)
  }, [user])

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    brand: '',
    baseWeight: '',
    barcode: '',
    productCategory: '',
    price: '',
    stock: '0',
    step: '1',
    minStockAlert: '0',
    promotionalPrice: '',
    sellerSpotlighted: false,
    isProhibitedForMinors: false,
    isPrescriptionRequired: false,
    measurementUnit: MeasurementUnit.Un,
    isActive: true,
  })
  const isUnit = form.measurementUnit === MeasurementUnit.Un
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

  const showPrescriptionToggle =
    form.productCategory && PHARMACY_TAGS.includes(form.productCategory)

  async function loadSellerProduct(id: string) {
    try {
      setIsFetching(true)
      setApiErrors(null)

      const response = await sellerProductService.getById(id)
      const sp = response?.data?.sellerProduct
      if (!sp) return

      setCatalog({
        id: sp.productCatalogId,
        name: sp.name,
        description: sp.description,
        productCategory: sp.productCategory,
        measurementUnit: sp.measurementUnit,
        baseWeight: sp.baseWeight,
        brand: sp.brand,
        barcode: sp.barcode,
        isProhibitedForMinors: sp.isProhibitedForMinors,
        isPrescriptionRequired: sp.isPrescriptionRequired,
        originalImages: sp.originalImages,
        processedImages: sp.processedImages,
      })

      setForm({
        name: sp.name || '',
        description: sp.description || '',
        brand: sp.brand || '',
        baseWeight: sp.baseWeight ? String(sp.baseWeight) : '',
        price: String(sp.price),
        stock: String(sp.stock),
        barcode: String(sp.barcode),
        step: String(sp.step ?? 1),
        productCategory: sp.productCategory as UserTags,

        minStockAlert: sp.minStockAlert ? String(sp.minStockAlert) : '',
        promotionalPrice: sp.promotionalPrice
          ? String(sp.promotionalPrice)
          : '',
        measurementUnit:
          (sp.measurementUnit as MeasurementUnit) ?? MeasurementUnit.Un,
        sellerSpotlighted: sp.sellerSpotlighted,
        isPrescriptionRequired: sp.isPrescriptionRequired,
        isProhibitedForMinors: sp.isProhibitedForMinors,
        isActive: sp.isActive ?? true,
      })

      if (sp.promotionalPrice && sp.promotionalPrice < sp.price) {
        setHasPromotion(true)
      } else {
        setHasPromotion(false)
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
        productCategory: cat.productCategory as UserTags,
        brand: cat.brand || '',
        baseWeight: cat.baseWeight ? String(cat.baseWeight) : '',
        isPrescriptionRequired: cat.isPrescriptionRequired,
        isProhibitedForMinors: cat.isProhibitedForMinors,
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
          name: form.name.trim(),
          description: form.description.trim(),
          brand: form.brand.trim(),
          productCategory: form.productCategory as UserTags,
          baseWeight: form.baseWeight ? parseFloat(form.baseWeight) : 0,
          measurementUnit: form.measurementUnit,
          isActive: form.isActive,
          sellerSpotlighted: form.sellerSpotlighted,
          isProhibitedForMinors: form.isProhibitedForMinors,
          isPrescriptionRequired: showPrescriptionToggle
            ? form.isPrescriptionRequired
            : false,
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
          name: form.name.trim(),
          description: form.description.trim(),
          brand: form.brand.trim(),
          baseWeight: form.baseWeight ? parseFloat(form.baseWeight) : 0,
          measurementUnit: form.measurementUnit,
          productCategory: form.productCategory as UserTags,
          sellerSpotlighted: form.sellerSpotlighted,
          isProhibitedForMinors: form.isProhibitedForMinors,
          isPrescriptionRequired: showPrescriptionToggle
            ? form.isPrescriptionRequired
            : false,
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
              <Text style={styles.searchResultCategory}>
                {catalog.barcode
                  ? `Cód: ${catalog.barcode}`
                  : 'Produto sem código de barras'}
              </Text>
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
            <Text style={components.input.label}>Categoria</Text>
            <View style={[components.input.container, { padding: 0 }]}>
              <Picker<UserTags | ''>
                selectedValue={
                  form.productCategory ? form.productCategory : undefined
                }
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, productCategory: v }))
                }
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
          </View>
        </>
      )}

      {/* Unidade de medida */}
      <View style={styles.fieldWrapper}>
        <Text style={components.input.label}>Unidade de medida</Text>
        <View style={[components.input.container, { padding: 0 }]}>
          <Picker<MeasurementUnit>
            selectedValue={form.measurementUnit}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, measurementUnit: v }))
            }
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
          />
        </View>
      )}

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
          Preço a cada {form.step}
          {form.measurementUnit} (R$) *
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
          >{`Preço promocional a cada ${form.step} ${form.measurementUnit}(R$) *`}</Text>
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

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          Produto ativo (visível para clientes)
        </Text>
        <Switch
          value={form.isActive}
          onValueChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
        />
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
