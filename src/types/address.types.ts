// src/types/address.types.ts
export enum AddressType {
  Casa = 'Casa',
  Trabalho = 'Trabalho',
  Outro = 'Outro',
}

export interface DeliveryAddress {
  id: string
  userId: string
  tenant: string
  label: AddressType
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  reference?: string
  deliveryInstructions?: string
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDeliveryAddressData {
  label: AddressType // ✅ Mudou de string para AddressType
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  reference?: string
  deliveryInstructions?: string
  isDefault?: boolean
  tenant: string
}

export interface UpdateDeliveryAddressData {
  label?: AddressType // ✅ Mudou de string para AddressType
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  reference?: string
  deliveryInstructions?: string
  isDefault?: boolean
}

export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}
