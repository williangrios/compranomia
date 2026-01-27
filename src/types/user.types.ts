// src/types/user.types.ts
import { UserRole } from '@wrcb/cb-common'

export interface User {
  id: string
  email: string
  nickName: string
  name: string
  role: UserRole
  tenant: string
  country: string
  language: string
  currency: string
  timeZone: string

  // Dados pessoais
  doc?: string
  whatsapp?: string
  phoneNumber?: string
  birthDate?: string | null

  // Endereço
  postalCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string

  // Localização (Compranomia)
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }

  // Perfil
  profilePhoto?: string
  bio?: string
  tags?: string[]

  // Verificações
  isEmailVerified: boolean
  isPhoneNumberVerified: boolean
  isWhatsappVerified: boolean
  isKycDone: boolean
  isPersonalDataProvided: boolean
  isAddressDataProvided: boolean
  isBusinessDataProvided: boolean

  // Status
  isBlocked: boolean
  showMyActivities: boolean

  // Redes sociais
  instagram?: string
  twitter?: string
  youtube?: string
  facebook?: string
  website?: string

  // Afiliado
  myAffiliateCode?: string
  affiliateCode?: string
  affiliateId?: string

  // Provider
  provider: string
  providerId?: string

  // Idiomas
  iSpeakLanguages?: string[]

  // Timestamps
  createdAt?: string
  updatedAt?: string
}

export interface SignUpData {
  email: string
  password: string
  passwordConfirmation: string
  nickName: string
  role: UserRole
  country: string
  tenant: string
  affiliateCode?: string
  coupon?: string
}

export interface SignInData {
  email: string
  password: string
  tenant: string
}

export interface VerifyEmailData {
  email: string
  code: string
  tenant: string
}

export interface UpdateUserAddressData {
  postalCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  country: string
}
