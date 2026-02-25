// app/(tabs)/search.tsx
import { useState, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { Header } from '@/components/ui/Header'
import { SearchProductCard } from '@/components/home/SearchProductCard'
import { useAddress } from '@/contexts/AddressContext'
import { sellerService } from '@/services/seller.service'
import { SellerProductResult } from '@/types'
import { homeStyles as styles } from '@/styles/home.styles'
import { colors, spacing } from '@/theme'

const DEBOUNCE_MS = 800
const SPINNER_DELAY_MS = 300
const MIN_QUERY_LENGTH = 3

export default function Search() {
  const router = useRouter()
  const { address, coordinates } = useAddress()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SellerProductResult[]>([])
  const [total, setTotal] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    // sempre que o endereço mudar, limpa a busca
    setQuery('')
    setResults([])
    setTotal(0)
    setHasSearched(false)
    setIsSearching(false)

    // opcional: focar no input novamente
    inputRef.current?.focus()
  }, [address?.id])

  const search = useCallback(
    async (text: string, skip = 0) => {
      if (!coordinates || text.trim().length < MIN_QUERY_LENGTH) return

      try {
        const response = await sellerService.searchProducts(
          text.trim(),
          coordinates.lat,
          coordinates.lng,
          { limit: 20, skip },
        )

        if (skip === 0) {
          setResults(response.products)
        } else {
          setResults((prev) => [...prev, ...response.products])
        }
        setTotal(response.total)
      } catch (error) {
        console.error('[SEARCH][FRONT][ERROR]', error)
      }
    },
    [coordinates],
  )

  function handleChangeText(text: string) {
    setQuery(text)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (text.trim().length < MIN_QUERY_LENGTH) {
      setResults([])
      setHasSearched(false)
      setTotal(0)
      return
    }

    debounceRef.current = setTimeout(() => {
      setHasSearched(true)
      setIsSearching(true)

      setTimeout(async () => {
        await search(text)
        setIsSearching(false)
      }, SPINNER_DELAY_MS)
    }, DEBOUNCE_MS)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setTotal(0)
    inputRef.current?.focus()
  }

  async function handleLoadMore() {
    if (isLoadingMore || results.length >= total) return

    setIsLoadingMore(true)
    await search(query, results.length)
    setIsLoadingMore(false)
  }

  function handleProductPress(product: SellerProductResult) {
    if (product.seller) {
      toastService.success({
        title: `🛍️ Você entrou na loja ${capitalizeFullName(product.seller.nickName)}`,
      })
      router.push(`/seller/${product.seller.id}`)
    }
  }

  // Sem endereço
  if (!address || !coordinates) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.noAddressContainer}>
          <Icon icon="MapPin" size={64} color={colors.primary} />
          <Text style={styles.noAddressTitle}>Selecione um endereço</Text>
          <Text style={styles.noAddressSubtitle}>
            Para buscar produtos, selecione um endereço de entrega.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Search Input */}
      <View style={searchStyles.inputWrapper}>
        <View style={searchStyles.inputContainer}>
          <Icon icon="Search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={searchStyles.input}
            value={query}
            onChangeText={handleChangeText}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={10}>
              <Icon icon="XCircle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conteúdo */}
      {isSearching && !hasSearched ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !hasSearched ? (
        <View style={styles.emptyContainer}>
          <Icon icon="Search" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            Digite para buscar produtos nas lojas da sua região
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={searchStyles.listContent}
          renderItem={({ item }) => (
            <SearchProductCard
              product={item}
              onPress={() => handleProductPress(item)}
            />
          )}
          ListEmptyComponent={
            isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon icon="Frown" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>
                  Ooops... Nenhum produto encontrado para "{query}"
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={searchStyles.loadingMore}
              />
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  )
}

import { StyleSheet } from 'react-native'
import { toastService } from '@/services/toast.service'
import { capitalizeFullName } from '@/utils/capitalizeFullName'

const searchStyles = StyleSheet.create({
  inputWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    height: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  loadingMore: {
    paddingVertical: spacing.md,
  },
})
