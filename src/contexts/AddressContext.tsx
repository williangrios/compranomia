import React, { createContext, useContext, useEffect, useState } from 'react'
import { storageService } from '@/services/storage.service'
import { deliveryAddressService } from '@/services/deliveryAddress.service'
import { DeliveryAddress } from '@/types'

interface AddressContextData {
  address: DeliveryAddress | null
  coordinates: { lat: number; lng: number } | null
  isLoading: boolean
  hasDeliveryAddress: boolean | null
  checkIfHasDeliveryAddress: () => Promise<void>
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
  const [hasDeliveryAddress, setHasDeliveryAddress] = useState<boolean | null>(
    null,
  )

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
      const { deliveryAddress } = await deliveryAddressService.setDefault(
        address.id,
      )
      setAddressState(deliveryAddress)
      await storageService.saveSelectedAddress(deliveryAddress)
    } catch (error) {
      console.error('Error setting default address:', error)
      throw error
    }
  }

  async function clearAddress() {
    setAddressState(null)
    setHasDeliveryAddress(null)
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

  async function checkIfHasDeliveryAddress() {
    setHasDeliveryAddress(null)
    try {
      const response = await deliveryAddressService.list()
      const hasAddress =
        Array.isArray(response.deliveryAddresses) &&
        response.deliveryAddresses.length > 0
      setHasDeliveryAddress(hasAddress)

      if (hasAddress) {
        const defaultAddress =
          response.deliveryAddresses.find((a: any) => a.isDefault) ||
          response.deliveryAddresses[0]

        setAddressState(defaultAddress)
        await storageService.saveSelectedAddress(defaultAddress)
      }
    } catch (error) {
      console.error('[AddressContext] checkIfHasDeliveryAddress error', error)
      setHasDeliveryAddress(false)
    }
  }

  return (
    <AddressContext.Provider
      value={{
        address,
        coordinates,
        isLoading,
        hasDeliveryAddress,
        setAddress,
        clearAddress,
        refreshAddressFromApi,
        checkIfHasDeliveryAddress,
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
