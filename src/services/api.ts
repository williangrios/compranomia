import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { storageService } from './storage.service'

console.log('[API] Base URL:', API_URL)

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
  (response) => {
    return response
  },
  async (error) => {
    if (error.response) {
      console.error('← Status:', error.response.status)
      console.error('← Data:', error.response.data)
    } else {
      console.error('← Network / Axios error:', error.message)
    }

    if (error.response?.status === 401) {
      await storageService.clearAuth()
    }

    return Promise.reject(error)
  },
)

export default api
