// src/constants/businessCategories.ts
import { Tenant, TenantDataService, UserCategory } from '@wrcb/cb-common'

/**
 * Busca as categorias disponíveis para o tenant Compranomia
 */
export function getCategoriesList(): UserCategory[] {
  const categories = TenantDataService.getCategoriesForTenant(
    Tenant.Compranomia,
  )
  return categories as UserCategory[]
}

/**
 * Busca as tags disponíveis para uma categoria específica
 */
export function getTagsForCategory(category: UserCategory): string[] {
  const tags = TenantDataService.getTagsForCategory(
    Tenant.Compranomia,
    category,
  )
  return tags.map((tag) => String(tag))
}

/**
 * Mapeamento de UserCategory para nomes em português
 */
export const CATEGORY_NAMES: Record<UserCategory, string> = {
  [UserCategory.Grocery]: 'Supermercado',
  [UserCategory.Pharmacy]: 'Farmácia',
  [UserCategory.Butcher]: 'Açougue',
  [UserCategory.Greengrocer]: 'Sacolão',
  [UserCategory.Bakery]: 'Padaria',
  [UserCategory.PetShop]: 'Pet Shop',
  [UserCategory.ConvenienceStore]: 'Conveniência',
  [UserCategory.Fishmonger]: 'Peixaria',
  [UserCategory.AgricultureStore]: 'Agropecuária',
  [UserCategory.Services]: 'Serviços',
  // Outros que não são usados no Compranomia mas precisam estar aqui
  [UserCategory.Female]: 'Feminino',
  [UserCategory.Male]: 'Masculino',
  [UserCategory.Couple]: 'Casal',
  [UserCategory.Trans]: 'Trans',
  [UserCategory.Tour]: 'Tour',
  [UserCategory.Restaurant]: 'Restaurante',
  [UserCategory.HomeServices]: 'Serviços Residenciais',
  [UserCategory.DayUse]: 'Day Use',
  [UserCategory.Transfer]: 'Transfer',
  [UserCategory.TourGuide]: 'Guia Turístico',
  [UserCategory.Show]: 'Show',
  [UserCategory.Event]: 'Evento',
}

/**
 * Retorna o nome em português de uma categoria
 */
export function getCategoryName(category: UserCategory): string {
  return CATEGORY_NAMES[category] || category
}
