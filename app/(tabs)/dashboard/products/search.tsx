// app/(tabs)/dashboard/products/search.tsx
import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/layout/Screen'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { colors, components } from '@/theme'
import { sellerProductService } from '@/services/sellerProduct.service'
import { productStyles as styles } from '@/styles/product.styles'
import { getApiErrors } from '@/utils/getApiErrors'

interface CatalogProduct {
  id: string
  name: string
  description: string
  productCategory: string
  brand?: string
  barcode?: string
  originalImages?: string[]
  processedImages?: string[]
}

interface ApiError {
  message: string
  field?: string
}

const DEFAULT_IMAGE = 'https://static.compranomia.com/defaults/product.png'

export default function SearchCatalog() {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CatalogProduct[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)

  async function handleSearch() {
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    try {
      setIsLoading(true)
      setApiErrors(null)

      const response = await sellerProductService.searchCatalog(trimmed)
      setResults(response?.data?.products ?? [])
      setHasSearched(true)
    } catch (error: unknown) {
      setApiErrors(getApiErrors(error))
    } finally {
      setIsLoading(false)
    }
  }

  function handleAdopt(catalog: CatalogProduct) {
    router.push({
      pathname: '/dashboard/products/adopt',
      params: { productCatalogId: catalog.id },
    })
  }

  function handleCreateNew() {
    router.push('/dashboard/products/new')
  }

  const getImageUri = useCallback((item: CatalogProduct) => {
    const images = item.processedImages?.length
      ? item.processedImages
      : item.originalImages
    return images?.[0] ?? DEFAULT_IMAGE
  }, [])

  function renderItem({ item }: { item: CatalogProduct }) {
    return (
      <View style={styles.searchResultItem}>
        <Image
          source={{ uri: getImageUri(item) }}
          style={styles.searchResultImage}
        />
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.brand && (
            <Text style={styles.searchResultBrand}>{item.brand}</Text>
          )}
          {item.barcode && (
            <Text style={styles.searchResultCategory}>Cód: {item.barcode}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchAdoptButton}
          onPress={() => handleAdopt(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    )
  }

  function renderEmpty() {
    if (!hasSearched) return null

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="search-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
        <TouchableOpacity
          style={[components.auth.buttonPrimary, { marginTop: 16 }]}
          onPress={handleCreateNew}
          activeOpacity={0.8}
        >
          <Text style={components.auth.buttonText}>Criar produto novo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function renderFooter() {
    if (!hasSearched || results.length === 0) return null

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Não encontrou o que procura?</Text>
        <TouchableOpacity
          style={[components.auth.buttonSecondary, { marginTop: 12 }]}
          onPress={handleCreateNew}
          activeOpacity={0.8}
        >
          <Text style={components.auth.buttonTextSecondary}>
            Criar produto novo
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 🔍 HEADER FIXO (fora da FlatList) */}
      <View style={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>Buscar no catálogo</Text>

        <View style={styles.fieldWrapper}>
          <TextInput
            style={[components.input.container, components.input.text]}
            value={query}
            onChangeText={(v) => {
              setQuery(v)
              setApiErrors(null)
            }}
            placeholder="Ex: alface, arroz, shampoo..."
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity
          style={components.auth.buttonPrimary}
          onPress={handleSearch}
          disabled={isLoading || query.trim().length < 2}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={components.auth.buttonText}>Buscar</Text>
          )}
        </TouchableOpacity>

        <ErrorMessage errors={apiErrors} />

        {hasSearched && results.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.hintText}>
              {results.length} produto(s) encontrado(s). Toque no "+" para
              adotar.
            </Text>
          </View>
        )}
      </View>

      {/* 📦 LISTA */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  )
}
