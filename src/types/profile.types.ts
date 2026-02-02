// src/types/profile.types.ts

export interface UpdateUserPersonalData {
  name: string
  doc: string
  birthDate?: string | null
  whatsapp?: string
  phoneNumber?: string
}

export interface UpdateUserBusinessData {
  nickName: string
  bio?: string
  category?: string
  iSpeakLanguages?: string[]
  location?: {
    coordinates: [number, number]
  }
}

export interface SellerSettings {
  id: string
  sellerId: string
  tenant: string
  deliveryRanges: DeliveryRange[]
  schedule: DaySchedule[]
  preparationTime: number
  cutoffTime: string
  exceptions: ScheduleException[]
  sellerActive: boolean
  adminActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DeliveryRange {
  minKm: number
  maxKm: number
  fee: number
  freeAbove: number
  averageDeliveryTime: number
}

export interface DaySchedule {
  dayOfWeek: number // 0 = Domingo, 6 = Sábado
  isOpen: boolean
  periods: TimePeriod[]
  cutoffTime?: string // "HH:MM" — opcional, null/undefined se fechado
}

export interface TimePeriod {
  openTime: string // "HH:MM"
  closeTime: string // "HH:MM"
}

export interface ScheduleException {
  date: string // ISO date
  isClosed: boolean
  periods?: TimePeriod[]
}

export interface CreateSellerSettingsData {
  deliveryRanges: DeliveryRange[]
  schedule: DaySchedule[]
  preparationTime: number
  exceptions?: ScheduleException[]
  sellerActive?: boolean
}
