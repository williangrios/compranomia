import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/theme'

interface SuccessResponse {
  status?: 'success'
  message?: string
}

interface SuccessMessageProps {
  success: SuccessResponse | null
}

export function SuccessMessage({ success }: SuccessMessageProps) {
  if (!success || !success.message) return null

  return (
    <View
      style={{
        backgroundColor: '#DCFCE7', // verde claro
        borderLeftWidth: 4,
        borderLeftColor: colors.success ?? '#16A34A',
        borderRadius: 8,
        padding: spacing.md,
        marginVertical: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={colors.success ?? '#16A34A'}
          style={{ marginRight: spacing.sm, marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: '#166534',
            }}
          >
            {success.message}
          </Text>
        </View>
      </View>
    </View>
  )
}
