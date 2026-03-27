// src/utils/constants.ts
import {
  Tenant,
  TenantDataService,
  UserCategory,
  UserTags,
} from '@wrcb/cb-common'
import { isUserTag } from './typeGuards/isUserTag'

// src/utils/constants.ts

export const tenantData = TenantDataService.getTenantData(Tenant.Compranomia)
export const API_URL = 'https://www.privateshow.com.br'
export const TENANT = Tenant.Compranomia
export const CACHE_TTL = 60000 // 1 minuto
export const API_VERSION = '2'
export const DEFAULT_IMAGE =
  'https://static.compranomia.com/defaults/product.png'
export const DEFAULT_AVATAR =
  'https://static.compranomia.com/defaults/seller.png'

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@compranomia:authToken',
  USER_DATA: '@compranomia:userData',
  SELECTED_ADDRESS: '@compranomia:selectedAddress',
  CART_DATA: '@compranomia:cart_data',
} as const

export const COMPRANOMIA_USER_CATEGORIES =
  TenantDataService.getCategoriesForTenant(Tenant.Compranomia)

export const COMPRANOMIA_TAGS: UserTags[] =
  TenantDataService.getAllTagsForTenant(Tenant.Compranomia).filter(isUserTag)

export const PHARMACY_TAGS: UserTags[] = TenantDataService.getTagsForCategory(
  Tenant.Compranomia,
  UserCategory.Pharmacy,
).filter(isUserTag)
