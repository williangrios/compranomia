import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Icon } from '@/components/ui/Icon'
import { colors } from '@/theme'

interface ProfilePhotoSelectorProps {
  currentPhoto?: string
  onPhotoSelected: (
    uri: string,
    file: {
      uri: string
      name: string
      type: string
    },
  ) => void
  onPhotoRemoved: () => void
}

export function ProfilePhotoSelector({
  currentPhoto,
  onPhotoSelected,
  onPhotoRemoved,
}: ProfilePhotoSelectorProps) {
  async function requestPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos',
      )
      return false
    }
    return true
  }

  async function handlePickImage() {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      const file = {
        uri: asset.uri,
        name: `profile_${Date.now()}.jpg`,
        type: 'image/jpeg',
      }
      onPhotoSelected(asset.uri, file)
    }
  }

  function handleRemovePhoto() {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover a foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', onPress: onPhotoRemoved, style: 'destructive' },
      ],
    )
  }

  return (
    <View style={{ alignItems: 'center', marginBottom: 24 }}>
      <View
        style={{
          width: 200,
          height: 200,
          borderRadius: 16,
          backgroundColor: colors.backgroundSecondary,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderWidth: 3,
          borderColor: colors.primary,
        }}
      >
        {currentPhoto ? (
          <Image
            source={{ uri: currentPhoto }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Icon icon="User" size={50} color={colors.textSecondary} />
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          onPress={handlePickImage}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon icon="Camera" size={20} color={colors.textInverse} />
          <Text style={{ color: colors.textInverse, fontWeight: '600' }}>
            {currentPhoto ? 'Alterar Foto' : 'Escolher Foto'}
          </Text>
        </TouchableOpacity>

        {currentPhoto && (
          <TouchableOpacity
            onPress={handleRemovePhoto}
            style={{
              backgroundColor: colors.danger,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon icon="Trash" size={20} color={colors.textInverse} />
            <Text style={{ color: colors.textInverse, fontWeight: '600' }}>
              Remover
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={{
          fontSize: 12,
          color: colors.textSecondary,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        Formatos: JPG, PNG (máx. 5MB)
      </Text>
    </View>
  )
}
