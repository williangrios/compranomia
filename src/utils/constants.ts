// src/utils/constants.ts
import { Tenant } from '@wrcb/cb-common'

// src/utils/constants.ts

export const API_URL = 'https://www.privateshow.com.br'
export const TENANT = Tenant.Compranomia
export const CACHE_TTL = 60000 // 1 minuto

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@compranomia:authToken',
  USER_DATA: '@compranomia:userData',
  SELECTED_ADDRESS: '@compranomia:selectedAddress',
} as const
