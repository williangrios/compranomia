import Toast from 'react-native-toast-message'

interface ToastOptions {
  title: string
  message?: string
}

export const toastService = {
  success({ title = 'Sucesso', message }: ToastOptions) {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
    })
  },

  error({ title = 'Ooops...', message }: ToastOptions) {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
    })
  },
}
