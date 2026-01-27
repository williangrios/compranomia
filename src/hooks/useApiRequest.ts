// src/hooks/useApiRequest.ts
import { useState } from 'react'
import api from '@/services/api'
import { apiCache } from '@/utils/apiCache'
import { TENANT } from '@/utils/constants'
import { ApiError, UseApiRequestParams } from '@/types/api.types'

export function useApiRequest<T = any>({
  url,
  method,
  body,
  headers: defaultHeaders,
  successMessage,
  onSuccess,
  onError,
  cache = { enabled: false },
}: UseApiRequestParams<T>) {
  const [errors, setErrors] = useState<ApiError[] | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const doRequest = async (
    props: {
      url?: string
      body?: any
      headers?: Record<string, string>
      useCache?: boolean
    } = {},
  ): Promise<T | void> => {
    try {
      const requestUrl = props.url ?? url
      const shouldUseCache = props.useCache ?? cache.enabled

      // Verificar cache apenas para GET
      if (method === 'GET' && shouldUseCache) {
        const cacheKey = cache.key || requestUrl
        const cachedData = apiCache.get(cacheKey)

        if (cachedData) {
          setData(cachedData)
          if (onSuccess) onSuccess(cachedData, 'Cached')
          return cachedData
        }
      }

      setIsLoading(true)
      setData(null)
      setErrors(null)
      setSuccess(null)

      let requestBody = props.body ?? body
      const customHeaders = props.headers ?? defaultHeaders ?? {}
      const isFormData = requestBody instanceof FormData

      // Adicionar tenant aos dados do body
      if (
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) &&
        requestBody
      ) {
        if (isFormData) {
          requestBody.append('tenant', TENANT)
        } else {
          requestBody = {
            ...requestBody,
            tenant: TENANT,
          }
        }
      }

      const config: any = {
        method,
        url: requestUrl,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...customHeaders,
        },
      }

      if (method !== 'GET' && method !== 'HEAD' && requestBody) {
        config.data = isFormData ? requestBody : requestBody
      }

      const response = await api.request(config)
      setResponseStatus(response.status)

      if (response.status === 204) {
        const message = successMessage ?? 'Success!'
        setSuccess(message)
        if (onSuccess) onSuccess({} as T, message)
        return {} as T
      }

      const responseData = response.data

      if (!responseData || responseData.status !== 'success') {
        const fallbackMessage = responseData?.message ?? 'GenericError'
        const fallbackErrors = responseData?.errors ?? [
          { message: fallbackMessage },
        ]
        setErrors(fallbackErrors)
        if (onError) {
          onError(fallbackErrors, response.status)
        }
        return
      }

      const data: T = responseData.data
      const message = successMessage ?? responseData.message ?? 'Success!'

      // Salvar no cache se habilitado
      if (method === 'GET' && shouldUseCache) {
        const cacheKey = cache.key || requestUrl
        apiCache.set(cacheKey, data, cache.ttl)
      }

      setData(data)
      setSuccess(message)
      if (onSuccess) onSuccess(data, message)
      return data
    } catch (err: any) {
      const status = err.response?.status || 400
      setResponseStatus(status)

      const errorMessage =
        err.response?.data?.message || err.message || 'Erro de conexão'
      const errors = err.response?.data?.errors || [{ message: errorMessage }]

      console.error('Erro useApiRequest:', errorMessage)
      setErrors(errors)

      if (onError) {
        onError(errors, status)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    doRequest,
    responseStatus,
    errors,
    success,
    data,
    isLoading,
  }
}
