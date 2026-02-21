import { PaymentMethod } from '@wrcb/cb-common'

export interface DeliveryRange {
  minKm: number
  maxKm: number
  fee: number
  freeAbove: number
  averageDeliveryTime: number
}

export interface SchedulePeriod {
  openTime: string
  closeTime: string
}

export interface ScheduleDay {
  dayOfWeek: number
  isOpen: boolean
  periods: SchedulePeriod[]
  cutoffTime?: string
}

export interface SellerSettingsPayload {
  sellerActive?: boolean
  deliveryRanges?: DeliveryRange[]
  schedule?: ScheduleDay[]
  acceptedPaymentMethods?: PaymentMethod[]
  preparationTime?: number
  allowOrdersWhenClosed?: boolean
}
