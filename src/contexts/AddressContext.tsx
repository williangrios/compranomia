// src/contexts/AddressContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { storageService } from '@/services/storage.service'
import { deliveryAddressService } from '@/services/deliveryAddress.service'

export interface DeliveryAddress {
  id: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  cep: string
  reference?: string
  isDefault: boolean
  isActive: boolean
}

interface AddressContextData {
  address: DeliveryAddress | null
  isLoading: boolean
  setAddress: (address: DeliveryAddress) => Promise<void>
  clearAddress: () => Promise<void>
  refreshAddressFromApi: () => Promise<void>
}

const AddressContext = createContext<AddressContextData>(
  {} as AddressContextData,
)

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddressState] = useState<DeliveryAddress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFromStorage()
  }, [])

  async function loadFromStorage() {
    try {
      const stored = await storageService.getSelectedAddress()
      if (stored) {
        setAddressState(stored)
      }
    } catch (error) {
      console.error('Error loading address from storage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function setAddress(address: DeliveryAddress) {
    try {
      // 1. Marca como padrão no backend
      await deliveryAddressService.setDefault(address.id)

      // 2. Atualiza localmente
      const updatedAddress = { ...address, isDefault: true }
      setAddressState(updatedAddress)

      // 3. Salva no AsyncStorage
      await storageService.saveSelectedAddress(updatedAddress)
    } catch (error) {
      console.error('Error setting default address:', error)
      throw error // Propaga erro para o componente tratar
    }
  }

  async function clearAddress() {
    setAddressState(null)
    await storageService.removeSelectedAddress()
  }

  async function refreshAddressFromApi() {
    try {
      const response = await deliveryAddressService.list()

      // Busca o endereço padrão na lista
      const defaultAddress = response.deliveryAddresses.find(
        (a: DeliveryAddress) => a.isDefault,
      )

      if (defaultAddress) {
        // Atualiza local sem chamar backend novamente
        setAddressState(defaultAddress)
        await storageService.saveSelectedAddress(defaultAddress)
      } else {
        // Se não tem padrão, limpa
        await clearAddress()
      }
    } catch (error) {
      console.error('Error refreshing address from API:', error)
    }
  }

  return (
    <AddressContext.Provider
      value={{
        address,
        isLoading,
        setAddress,
        clearAddress,
        refreshAddressFromApi,
      }}
    >
      {children}
    </AddressContext.Provider>
  )
}

export function useAddress() {
  const context = useContext(AddressContext)

  if (!context) {
    throw new Error('useAddress must be used within AddressProvider')
  }

  return context
}
