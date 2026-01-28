import React, { createContext, useContext, useEffect, useState } from 'react'
import { storageService } from '@/services/storage.service'
import api from '@/services/api'

export interface DeliveryAddress {
  id: string
  label: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cep: string
  isDefault: boolean
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
    const stored = await storageService.getSelectedAddress()
    if (stored) setAddressState(stored)
    setIsLoading(false)
  }

  async function setAddress(address: DeliveryAddress) {
    setAddressState(address)
    await storageService.saveSelectedAddress(address)
  }

  async function clearAddress() {
    setAddressState(null)
    await storageService.removeSelectedAddress()
  }

  async function refreshAddressFromApi() {
    const response = await api.get('/api/business/compranomia/delivery-address')

    if (response.data.status === 'success') {
      const defaultAddress = response.data.data.addresses.find(
        (a: DeliveryAddress) => a.isDefault,
      )

      if (defaultAddress) {
        await setAddress(defaultAddress)
      }
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
  return useContext(AddressContext)
}
