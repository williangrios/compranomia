import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/utils/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  sellerProductId: string
  productCatalogId: string
  name: string
  price: number
  promotionalPrice?: number | null
  quantity: number
  measurementUnit: string
  step: number
  image: string
  stock: number
}

export interface SellerCart {
  sellerId: string
  sellerName: string
  sellerPhoto: string
  items: CartItem[]
}

interface CartContextData {
  carts: Record<string, SellerCart>
  addItem: (
    sellerId: string,
    sellerInfo: { name: string; photo: string },
    item: CartItem,
  ) => void
  updateQuantity: (
    sellerId: string,
    sellerProductId: string,
    quantity: number,
  ) => void
  removeItem: (sellerId: string, sellerProductId: string) => void
  clearCart: (sellerId: string) => void
  getCart: (sellerId: string) => SellerCart | null
  getCartCount: (sellerId: string) => number
  getCartTotal: (sellerId: string) => number
  getCartSubtotal: (sellerId: string) => number
  getAllCarts: () => SellerCart[]
  getTotalCartsCount: () => number
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextData>({} as CartContextData)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getItemPrice(item: CartItem): number {
  if (item.promotionalPrice != null && item.promotionalPrice < item.price) {
    return item.promotionalPrice
  }
  return item.price
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [carts, setCarts] = useState<Record<string, SellerCart>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar do AsyncStorage ao montar
  useEffect(() => {
    async function load() {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.CART_DATA)
        if (data) {
          setCarts(JSON.parse(data))
        }
      } catch (error) {
        console.error('[CART] Error loading cart:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  // Persistir no AsyncStorage sempre que mudar
  useEffect(() => {
    if (!isLoaded) return
    AsyncStorage.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(carts)).catch(
      (error) => console.error('[CART] Error saving cart:', error),
    )
  }, [carts, isLoaded])

  const addItem = useCallback(
    (
      sellerId: string,
      sellerInfo: { name: string; photo: string },
      item: CartItem,
    ) => {
      setCarts((prev) => {
        const cart = prev[sellerId] || {
          sellerId,
          sellerName: sellerInfo.name,
          sellerPhoto: sellerInfo.photo,
          items: [],
        }

        const existingIndex = cart.items.findIndex(
          (i) => i.sellerProductId === item.sellerProductId,
        )

        let updatedItems: CartItem[]

        if (existingIndex >= 0) {
          // Incrementar quantidade
          updatedItems = cart.items.map((i, idx) =>
            idx === existingIndex
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          )
        } else {
          updatedItems = [...cart.items, item]
        }

        return {
          ...prev,
          [sellerId]: { ...cart, items: updatedItems },
        }
      })
    },
    [],
  )

  const updateQuantity = useCallback(
    (sellerId: string, sellerProductId: string, quantity: number) => {
      setCarts((prev) => {
        const cart = prev[sellerId]
        if (!cart) return prev

        if (quantity <= 0) {
          const filtered = cart.items.filter(
            (i) => i.sellerProductId !== sellerProductId,
          )
          if (filtered.length === 0) {
            const { [sellerId]: _, ...rest } = prev
            return rest
          }
          return { ...prev, [sellerId]: { ...cart, items: filtered } }
        }

        return {
          ...prev,
          [sellerId]: {
            ...cart,
            items: cart.items.map((i) =>
              i.sellerProductId === sellerProductId ? { ...i, quantity } : i,
            ),
          },
        }
      })
    },
    [],
  )

  const removeItem = useCallback(
    (sellerId: string, sellerProductId: string) => {
      setCarts((prev) => {
        const cart = prev[sellerId]
        if (!cart) return prev

        const filtered = cart.items.filter(
          (i) => i.sellerProductId !== sellerProductId,
        )

        if (filtered.length === 0) {
          const { [sellerId]: _, ...rest } = prev
          return rest
        }

        return { ...prev, [sellerId]: { ...cart, items: filtered } }
      })
    },
    [],
  )

  const clearCart = useCallback((sellerId: string) => {
    setCarts((prev) => {
      const { [sellerId]: _, ...rest } = prev
      return rest
    })
  }, [])

  const getCart = useCallback(
    (sellerId: string): SellerCart | null => {
      return carts[sellerId] || null
    },
    [carts],
  )

  const getCartCount = useCallback(
    (sellerId: string): number => {
      const cart = carts[sellerId]
      if (!cart) return 0
      return cart.items.length
    },
    [carts],
  )

  const getCartSubtotal = useCallback(
    (sellerId: string): number => {
      const cart = carts[sellerId]
      if (!cart) return 0
      return cart.items.reduce((sum, item) => {
        const price = getItemPrice(item)
        return sum + price * item.quantity
      }, 0)
    },
    [carts],
  )

  const getCartTotal = useCallback(
    (sellerId: string): number => {
      // Subtotal apenas — delivery fee será calculado no checkout
      return getCartSubtotal(sellerId)
    },
    [getCartSubtotal],
  )

  const getAllCarts = useCallback((): SellerCart[] => {
    return Object.values(carts)
  }, [carts])

  const getTotalCartsCount = useCallback((): number => {
    return Object.values(carts).reduce(
      (sum, cart) => sum + cart.items.length,
      0,
    )
  }, [carts])

  return (
    <CartContext.Provider
      value={{
        carts,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getCart,
        getCartCount,
        getCartTotal,
        getCartSubtotal,
        getAllCarts,
        getTotalCartsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
