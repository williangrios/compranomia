// src/components/ui/ProfileHeader.tsx
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme'

interface ProfileHeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap
    onPress: () => void
  }
}

export function ProfileHeader({
  title,
  showBack = false,
  rightAction,
}: ProfileHeaderProps) {
  const router = useRouter()

  const ProfileHeader_HEIGHT = Platform.OS === 'ios' ? 88 : 56
  const STATUS_BAR_HEIGHT =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0

  return (
    <View
      style={{
        height: ProfileHeader_HEIGHT + STATUS_BAR_HEIGHT,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingTop: Platform.OS === 'ios' ? 44 : STATUS_BAR_HEIGHT,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      >
        {/* Left - Back Button or Spacer */}
        <View style={{ width: 40 }}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title && (
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Right - Action or Spacer */}
        <View style={{ width: 40 }}>
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={rightAction.icon}
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}
