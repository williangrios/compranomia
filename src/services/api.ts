import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { storageService } from './storage.service'
import { translateError } from '@/utils/errorMessages'
import { Alert, Linking, Platform } from 'react-native'
import { Tenant } from '@wrcb/cb-common'

let updateAlertShown = false

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('→ ERROR getting token:', error)
    }

    config.headers['x-tenant'] = Tenant.Compranomia
    config.headers['x-app-version'] = '1'

    if (config.data instanceof FormData) {
      console.log('→ multipart/form-data detected (RN will handle boundary)')
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se 426, mostra alerta de update e não processa mais nada
    // 426 é o caso de app desatualizado em relação à api
    if (error?.response?.status === 426) {
      showUpdateAlert()
      return Promise.reject(error)
    }

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

function showUpdateAlert() {
  if (updateAlertShown) return
  updateAlertShown = true

  const storeUrl = Platform.select({
    ios: 'https://apps.apple.com/app/SEU_APP_ID',
    android: 'https://play.google.com/store/apps/details?id=SEU_PACKAGE',
  })

  Alert.alert(
    'Atualização necessária',
    'Uma nova versão do app está disponível. Atualize para ter novos recursos incríveis.',
    [
      {
        text: 'Atualizar',
        onPress: () => {
          updateAlertShown = false
          if (storeUrl) Linking.openURL(storeUrl)
        },
      },
    ],
    { cancelable: false },
  )
}

export default api
