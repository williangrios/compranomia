// src/utils/formatters.ts

export const formatters = {
  /**
   * Formata CEP (12345678 -> 12345-678)
   */
  cep(value: string): string {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 5) return cleaned
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
  },

  /**
   * Remove formatação do CEP
   */
  cleanCEP(value: string): string {
    return value.replace(/\D/g, '')
  },

  /**
   * Formata telefone brasileiro
   */
  phone(value: string): string {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    }
    if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }

    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  },

  /**
   * Trunca texto longo
   */
  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  },
}
