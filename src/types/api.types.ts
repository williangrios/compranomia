// src/types/api.types.ts

export interface ApiError {
  message: string
  field?: string
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data: T
  errors?: ApiError[]
}

export interface UseApiRequestParams<T> {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  successMessage?: string
  onSuccess?: (data: T, message: string) => void
  onError?: (errors: ApiError[], statusCode?: number) => void
  cache?: {
    enabled: boolean
    ttl?: number
    key?: string
  }
}
