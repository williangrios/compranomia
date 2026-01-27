// src/utils/validators.ts

export const validators = {
  /**
   * Valida email
   */
  email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Valida senha (min 6 caracteres)
   */
  password(password: string): boolean {
    return password.length >= 6 && password.length <= 30
  },

  /**
   * Valida nickname (3-20 caracteres, sem hífen no final)
   */
  nickName(nickName: string): boolean {
    if (nickName.length < 3 || nickName.length > 20) return false
    if (nickName.endsWith('-')) return false
    return true
  },

  /**
   * Valida CEP (formato brasileiro)
   */
  cep(cep: string): boolean {
    const cleanCEP = cep.replace(/\D/g, '')
    return cleanCEP.length === 8
  },

  /**
   * Valida código de verificação (6 dígitos)
   */
  verificationCode(code: string): boolean {
    return /^\d{6}$/.test(code)
  },
}
