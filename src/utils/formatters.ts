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
   * Formata CPF (12345678901 -> 123.456.789-01)
   */
  cpf(value: string): string {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)

    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    }
    if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    }

    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
      6,
      9,
    )}-${cleaned.slice(9)}`
  },

  /**
   * Remove formatação do CPF
   */
  cleanCPF(value: string): string {
    return value.replace(/\D/g, '')
  },

  /**
   * Formata data DD/MM/AAAA
   */
  date(value: string): string {
    if (!value) return ''

    // Aceita:
    // - 1985-05-18
    // - 1985-05-18T00:00:00.000Z
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/)

    if (!isoMatch) {
      return ''
    }

    const [, year, month, day] = isoMatch

    return `${day}/${month}/${year}`
  },

  dateMask(value: string): string {
    if (!value) return ''

    const numbers = value.replace(/\D/g, '').slice(0, 8)

    const day = numbers.slice(0, 2)
    const month = numbers.slice(2, 4)
    const year = numbers.slice(4, 8)

    if (numbers.length <= 2) return day
    if (numbers.length <= 4) return `${day}/${month}`

    return `${day}/${month}/${year}`
  },

  /**
   * Remove formatação da data
   */
  cleanDate(date: string): string | null {
    if (!date) return null

    // Esperado: DD/MM/YYYY
    const parts = date.split('/')

    if (parts.length !== 3) return null

    const [day, month, year] = parts

    if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
      return null
    }

    // Retorna ISO 8601 (YYYY-MM-DD)
    return `${year}-${month}-${day}`
  },

  /**
   * Formata CNPJ (12345678000199 -> 12.345.678/0001-99)
   */
  cnpj(value: string): string {
    const cleaned = value.replace(/\D/g, '').slice(0, 14)

    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
    }
    if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
    }
    if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(
        5,
        8,
      )}/${cleaned.slice(8)}`
    }

    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(
      5,
      8,
    )}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
  },

  /**
   * Remove formatação do CNPJ
   */
  cleanCNPJ(value: string): string {
    return value.replace(/\D/g, '')
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
