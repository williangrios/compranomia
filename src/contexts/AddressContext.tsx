import React, { createContext, useContext, useEffect, useState } from 'react'
import { storageService } from '@/services/storage.service'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { DeliveryAddress } from '@/types'

interface AddressContextData {
  address: DeliveryAddress | null
  coordinates: { lat: number; lng: number } | null
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

  const coordinates = address?.location?.coordinates
    ? {
        lat: address.location.coordinates[1],
        lng: address.location.coordinates[0],
      }
    : null

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
      await deliveryAddressService.setDefault(address.id)
      const updatedAddress = { ...address, isDefault: true }
      setAddressState(updatedAddress)
      await storageService.saveSelectedAddress(updatedAddress)
    } catch (error) {
      console.error('Error setting default address:', error)
      throw error
    }
  }

  async function clearAddress() {
    setAddressState(null)
    await storageService.removeSelectedAddress()
  }

  async function refreshAddressFromApi() {
    try {
      const response = await deliveryAddressService.list()
      const defaultAddress = response.deliveryAddresses.find(
        (a: DeliveryAddress) => a.isDefault,
      )
      if (defaultAddress) {
        setAddressState(defaultAddress)
        await storageService.saveSelectedAddress(defaultAddress)
      } else {
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
        coordinates,
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
