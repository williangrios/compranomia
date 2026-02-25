// src/components/ui/ErrorMessage.tsx
import { View, Text } from 'react-native'
import { Icon } from '@/components/ui/Icon'
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
        <View style={{ marginRight: spacing.sm, marginTop: 2 }}>
          <Icon icon="AlertCircle" size={20} color={colors.error} />
        </View>
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
