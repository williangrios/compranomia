export function getApiErrors(error: any) {
  return (
    error?.normalizedErrors ||
    error?.response?.data?.errors || [{ message: 'GenericError' }]
  )
}

export function genericApiError() {
  return [{ message: 'GenericError' }]
}
