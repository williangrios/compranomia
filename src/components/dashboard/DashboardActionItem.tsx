import { View, Text, TouchableOpacity } from 'react-native'
import { Icon, IconName } from '@/components/ui/Icon'
import { colors } from '@/theme'

interface Props {
  title: string
  subtitle: string
  icon: IconName
  onPress: () => void
}

export function DashboardActionItem({ title, subtitle, icon, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: colors.primary + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon icon={icon} size={20} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Icon icon="ChevronRight" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  )
}
