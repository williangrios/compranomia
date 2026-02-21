export function getApiErrors(error: any) {
  console.log('-------------------', error)
  console.log('-------------------', error?.normalizedErrors)
  console.log('-------------------', error?.response?.data?.errors)
  return (
    error?.normalizedErrors ||
    error?.response?.data?.errors || [{ message: 'GenericError' }]
  )
}

export function genericApiError() {
  return [{ message: 'GenericError' }]
}
