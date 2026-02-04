import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { storageService } from './storage.service'
import { translateError } from '@/utils/errorMessages'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
  withCredentials: true,
})

/**
 * 🚨 ATENÇÃO
 * - NÃO remover Content-Type em React Native
 * - NÃO forçar multipart
 * - RN + Axios cuidam do boundary
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.log('→ NO TOKEN FOUND IN STORAGE')
      }
    } catch (error) {
      console.error('→ ERROR getting token:', error)
    }
    if (config.data instanceof FormData) {
      console.log('→ multipart/form-data detected (RN will handle boundary)')
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data

    if (data?.errors && Array.isArray(data.errors)) {
      error.normalizedErrors = data.errors.map((err: any) => ({
        field: err.field,
        message: translateError(err.message),
      }))
    } else {
      error.normalizedErrors = [{ message: translateError('GenericError') }]
    }

    return Promise.reject(error)
  },
)

export default api
