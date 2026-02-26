import * as LucideIcons from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'

export type IconName = keyof typeof LucideIcons

type Props = {
  icon: IconName
  size?: number
  color?: string
  strokeWidth?: number
  fill?: string // ← adicione
  style?: StyleProp<ViewStyle>
}

export function Icon({
  icon,
  size = 24,
  color = '#000',
  strokeWidth = 2,
  style,
  fill,
}: Props) {
  const LucideIcon = LucideIcons[icon] as React.ComponentType<{
    size?: number
    color?: string
    strokeWidth?: number
    fill?: string
  }>
  if (!LucideIcon) {
    console.warn(`Icon "${icon}" not found in lucide-react-native`)
    return null
  }
  if (style) {
    return (
      <View style={style}>
        <LucideIcon
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          fill={fill ?? 'none'}
        />
      </View>
    )
  }
  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill ?? 'none'}
    />
  )
}
