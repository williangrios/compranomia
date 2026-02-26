import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@/theme'

interface DiscountBadgeProps {
  percent: number
  minToShow?: number
  size?: 'sm' | 'md' | 'lg'
}

export function DiscountBadge({
  percent,
  minToShow = 1,
  size = 'sm',
}: DiscountBadgeProps) {
  if (!percent || percent < minToShow) return null

  const sizeStyles = SIZE_MAP[size]

  return (
    <View style={[s.badge, sizeStyles.badge]}>
      <Text style={[s.text, sizeStyles.text]}>🔥 -{percent}%</Text>
    </View>
  )
}

const SIZE_MAP = {
  sm: {
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    text: {
      fontSize: 11,
    },
  },
  md: {
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    text: {
      fontSize: 13,
    },
  },
  lg: {
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    text: {
      fontSize: 15,
    },
  },
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.success,
    zIndex: 10,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
  },
})
