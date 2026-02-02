export interface DeliveryRange {
  minKm: number
  maxKm: number
  fee: number
  freeAbove: number
}

export interface SchedulePeriod {
  openTime: string
  closeTime: string
}

export interface ScheduleDay {
  dayOfWeek: number
  isOpen: boolean
  periods: SchedulePeriod[]
}

export interface SellerSettingsPayload {
  sellerActive?: boolean
  deliveryRanges?: DeliveryRange[]
  schedule?: ScheduleDay[]
  preparationTime?: number
  cutoffTime?: string
}
