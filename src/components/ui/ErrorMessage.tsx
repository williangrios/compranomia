// src/components/ui/ErrorMessage.tsx
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/theme'
import { translateError } from '@/utils/errorMessages'

interface ApiError {
  message: string
  field?: string
}

interface ErrorMessageProps {
  errors: ApiError[] | null
}

export function ErrorMessage({ errors }: ErrorMessageProps) {
  if (!errors || errors.length === 0) return null

  return (
    <View
      style={{
        backgroundColor: '#FEE2E2',
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
        borderRadius: 8,
        padding: spacing.md,
        marginVertical: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Ionicons
          name="alert-circle"
          size={20}
          color={colors.error}
          style={{ marginRight: spacing.sm, marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
          {errors.map((err, idx) => (
            <Text
              key={idx}
              style={{
                fontSize: 14,
                color: '#991B1B',
                marginBottom: idx < errors.length - 1 ? spacing.xs : 0,
              }}
            >
              • {translateError(err.message)}
            </Text>
          ))}
        </View>
      </View>
    </View>
  )
}
