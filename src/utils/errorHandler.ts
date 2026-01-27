// src/utils/errorHandler.ts

interface ApiError {
  message: string
  field?: string
}

export interface FormattedError {
  errors: ApiError[]
}

/**
 * Formata erros da API para o formato padrão do app
 * A API SEMPRE retorna: { errors: [{ message: "..." }] }
 */
export function formatApiError(error: any): FormattedError {
  console.log('🔍 formatApiError - Erro completo:', error)
  console.log('🔍 formatApiError - error.response:', error.response)
  console.log('🔍 formatApiError - error.response?.data:', error.response?.data)

  // Se é erro do Axios com resposta do backend
  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    console.log('✅ Retornando erros do backend:', error.response.data.errors)
    return { errors: error.response.data.errors }
  }

  // Erro de rede/timeout
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    console.log('❌ Erro de conexão')
    return { errors: [{ message: 'ConnectionError' }] }
  }

  // Timeout
  if (error.code === 'ETIMEDOUT') {
    console.log('❌ Timeout')
    return { errors: [{ message: 'TimeoutError' }] }
  }

  // Erro genérico (não deveria chegar aqui se o backend estiver correto)
  console.log('❌ Erro genérico - estrutura não reconhecida')
  return { errors: [{ message: 'GenericError' }] }
}
