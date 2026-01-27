// src/services/api.ts
import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { storageService } from './storage.service'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para cookies
})

// Interceptor para adicionar token (se necessário)
api.interceptors.request.use(
  async (config) => {
    const token = await storageService.getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se token inválido/expirado, limpar storage
    if (error.response?.status === 401) {
      await storageService.clearAuth()
    }
    return Promise.reject(error)
  },
)

export default api
