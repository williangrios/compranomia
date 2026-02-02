// src/components/profile/ProfileMenuItem.tsx
import { TouchableOpacity, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'

interface ProfileMenuItemProps {
  icon?: keyof typeof Ionicons.glyphMap // ← agora opcional
  title: string
  subtitle?: string
  onPress: () => void
  showBadge?: boolean
  isDestructive?: boolean
}

export function ProfileMenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showBadge = false,
  isDestructive = false,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icone — só renderiza se fornecido */}
      {icon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDestructive
              ? colors.error + '20'
              : colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={isDestructive ? colors.error : colors.primary}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDestructive ? colors.error : colors.textPrimary,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {subtitle}
          </Text>
        )}
      </View>

      {showBadge && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.error,
            marginRight: 8,
          }}
        />
      )}

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  )
}
