// src/utils/image/imageCompression.helper.ts
import * as ImageManipulator from 'expo-image-manipulator'
import { ImagePickerAsset } from 'expo-image-picker'

/**
 * Parâmetros de compressão seguros e universais
 */
const MAX_WIDTH = 1024
const JPEG_QUALITY = 0.8

/**
 * Normaliza uma imagem para upload / IA
 * - Mantém proporção
 * - Nunca aumenta imagem
 * - Remove EXIF
 * - Evita compressão dupla
 */
export async function compressImage(
  image: ImagePickerAsset,
): Promise<ImagePickerAsset> {
  // Segurança: se não houver dimensões, retorna original
  if (!image.width || !image.height) {
    return image
  }

  // Se já for pequena o suficiente, não mexe
  if (image.width <= MAX_WIDTH) {
    return image
  }

  const resizeRatio = MAX_WIDTH / image.width
  const targetHeight = Math.round(image.height * resizeRatio)

  const manipulated = await ImageManipulator.manipulateAsync(
    image.uri,
    [
      {
        resize: {
          width: MAX_WIDTH,
          height: targetHeight,
        },
      },
    ],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: false, // importante: não gerar base64 aqui
    },
  )

  return {
    ...image,
    uri: manipulated.uri,
    width: MAX_WIDTH,
    height: targetHeight,
  }
}
