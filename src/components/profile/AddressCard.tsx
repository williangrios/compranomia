// src/components/profile/AddressCard.tsx
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DeliveryAddress } from '@/types'
import { colors } from '@/theme'

interface AddressCardProps {
  address: DeliveryAddress
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Excluir Endereço',
      'Tem certeza que deseja excluir este endereço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    )
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: address.isDefault ? 2 : 1,
        borderColor: address.isDefault ? colors.primary : colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textPrimary,
              marginLeft: 8,
            }}
          >
            {address.label}
          </Text>
          {address.isDefault && (
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                backgroundColor: colors.primary + '20',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                PADRÃO
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={onEdit}>
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Address */}
      <Text
        style={{
          fontSize: 14,
          color: colors.textPrimary,
          marginBottom: 4,
        }}
      >
        {address.street}, {address.number}
        {address.complement && ` - ${address.complement}`}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
        {address.neighborhood} - {address.city}/{address.state}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
        CEP: {address.cep}
      </Text>

      {address.reference && (
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 8,
            fontStyle: 'italic',
          }}
        >
          Ref: {address.reference}
        </Text>
      )}

      {/* Set as default button */}
      {!address.isDefault && (
        <TouchableOpacity
          style={{
            marginTop: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: colors.primary + '10',
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}
          onPress={onSetDefault}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.primary,
            }}
          >
            Definir como padrão
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
