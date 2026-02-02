import { useState } from 'react'
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
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { compressImage } from '@/utils/image/imageCompression.helper'
import { Screen } from '@/components/layout/Screen'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SuccessMessage } from '@/components/ui/SuccessMessage'
import { colors, components } from '@/theme'

import { productEnrichmentService } from '@/services/productEnrichment.service'
import { sellerProductService } from '@/services/sellerProduct.service'

import { MeasurementUnit, UserTags } from '@wrcb/cb-common'
import { COMPRANOMIA_TAGS, PHARMACY_TAGS } from '@/utils/constants'
import { formatApiError } from '@/utils/errorHandler'
import { sortByLabel, userTagsLabels } from '@/utils/enumLabels/userTags.labels'

interface ApiError {
  message: string
  field?: string
}

interface FormErrors {
  name?: string
  price?: string
  stock?: string
}

interface ProductForm {
  name: string
  description: string
  brand: string
  productCategory: UserTags | ''
  measurementUnit: MeasurementUnit | ''
  baseWeight: string
  price: string
  stock: string
}

export default function AddProduct() {
  const router = useRouter()
  const sortedTags = sortByLabel(COMPRANOMIA_TAGS, userTagsLabels)
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    brand: '',
    productCategory: '',
    measurementUnit: '',
    baseWeight: '',
    price: '',
    stock: '0',
  })

  const [restrictedToAdults, setRestrictedToAdults] = useState(false)
  const [requiresPrescription, setRequiresPrescription] = useState(false)
  const [showPrescriptionToggle, setShowPrescriptionToggle] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<{ message: string } | null>(null)

  function setField<K extends keyof ProductForm>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setApiErrors(null)
    setSuccess(null)
  }

  function resetAll() {
    setImage(null)
    setForm({
      name: '',
      description: '',
      brand: '',
      productCategory: '',
      measurementUnit: '',
      baseWeight: '',
      price: '',
      stock: '0',
    })
    setRestrictedToAdults(false)
    setRequiresPrescription(false)
    setShowPrescriptionToggle(false)
    setErrors({})
    setApiErrors(null)
    setSuccess(null)
  }

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

  async function handleEnrichFromImage() {
    if (!image) return

    try {
      setIsEnriching(true)
      setApiErrors(null)
      setSuccess(null)

      const enriched = await productEnrichmentService.enrich(image)

      setForm((p) => ({
        ...p,
        name: enriched.name ?? '',
        description: enriched.description ?? '',
        brand: enriched.brand ?? '',
        productCategory: (enriched.productCategory as UserTags) ?? '',
        measurementUnit: (enriched.measurementUnit as MeasurementUnit) ?? '',
        baseWeight: enriched.baseWeight ? String(enriched.baseWeight) : '',
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
    } catch (error: any) {
      const formatted = formatApiError(error)
      setApiErrors(formatted.errors)
    } finally {
      setIsEnriching(false)
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!form.price) newErrors.price = 'Preço é obrigatório'
    if (!form.stock) newErrors.stock = 'Estoque é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
        productCategory: form.productCategory || undefined,
        measurementUnit: form.measurementUnit || undefined,
        baseWeight: form.baseWeight ? Number(form.baseWeight) : undefined,
        price: Number(form.price),
        stock: Number(form.stock),
        images: image ? [{ uri: image.uri }] : [],
      })

      setSuccess({ message: 'Produto criado com sucesso' })
      setTimeout(() => router.back(), 800)
    } catch (error: any) {
      const formatted = formatApiError(error)
      setApiErrors(formatted.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen>
      {/* PREVIEW */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: '50%', aspectRatio: 3 / 4 }}>
          {image ? (
            <>
              <Image
                source={{ uri: image.uri }}
                style={{ width: '100%', height: '100%', borderRadius: 8 }}
              />
              <TouchableOpacity
                onPress={resetAll}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: '#000000aa',
                  borderRadius: 12,
                  padding: 6,
                }}
              >
                <Text style={{ color: '#fff' }}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={[
                components.input.container,
                { justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <Text>Nenhuma imagem</Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity
            style={[components.auth.buttonSecondary, { marginRight: 8 }]}
            onPress={pickFromCamera}
          >
            <Text>Usar câmera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={components.auth.buttonSecondary}
            onPress={pickFromGallery}
          >
            <Text>Abrir galeria</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[components.auth.buttonSecondary, { marginBottom: 16 }]}
        onPress={handleEnrichFromImage}
        disabled={!image || isEnriching}
        activeOpacity={0.8}
      >
        {isEnriching ? <ActivityIndicator /> : <Text>Preencher com IA</Text>}
      </TouchableOpacity>

      {/* CAMPOS */}
      {(
        [
          ['name', 'Nome'],
          ['description', 'Descrição'],
          ['brand', 'Marca'],
          ['baseWeight', 'Peso / Volume'],
          ['price', 'Preço'],
          ['stock', 'Estoque'],
        ] as [keyof ProductForm, string][]
      ).map(([field, label]) => (
        <View key={field} style={{ marginBottom: 16 }}>
          <Text style={components.input.label}>{label}</Text>
          <TextInput
            style={[
              components.input.container,
              components.input.text,
              errors[field as keyof FormErrors] && components.input.error,
            ]}
            value={form[field]}
            onChangeText={(v) => setField(field, v)}
            multiline={field === 'description'}
            keyboardType={
              field === 'price' || field === 'stock' || field === 'baseWeight'
                ? 'numeric'
                : 'default'
            }
          />
          {errors[field as keyof FormErrors] && (
            <Text style={components.auth.errorText}>
              {errors[field as keyof FormErrors]}
            </Text>
          )}
        </View>
      ))}

      {/* CATEGORIA */}
      <Text style={components.input.label}>Categoria</Text>
      <Picker<UserTags>
        selectedValue={form.productCategory || undefined}
        onValueChange={(v) => {
          setForm((p) => ({ ...p, productCategory: v }))
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
            value={tag} // enum real (backend + IA)
            label={userTagsLabels[tag] ?? tag} // label amigável
          />
        ))}
      </Picker>

      {/* UNIDADE */}
      <Text style={components.input.label}>Unidade</Text>
      <Picker<MeasurementUnit>
        selectedValue={form.measurementUnit || undefined}
        onValueChange={(v) => setForm((p) => ({ ...p, measurementUnit: v }))}
      >
        <Picker.Item label="Selecione" value={undefined} />
        {Object.values(MeasurementUnit).map((u) => (
          <Picker.Item key={u} label={u} value={u} />
        ))}
      </Picker>

      {/* FLAGS */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Venda proibida para menores</Text>
        <Switch
          value={restrictedToAdults}
          onValueChange={setRestrictedToAdults}
        />
      </View>

      {showPrescriptionToggle && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Exige receita médica</Text>
          <Switch
            value={requiresPrescription}
            onValueChange={setRequiresPrescription}
          />
        </View>
      )}

      <SuccessMessage success={success} />
      <ErrorMessage errors={apiErrors} />

      <TouchableOpacity
        style={components.auth.buttonPrimary}
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
