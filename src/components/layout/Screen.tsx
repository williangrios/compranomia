import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/theme'

interface Props {
  children: React.ReactNode
  scroll?: boolean
}

const TAB_BAR_HEIGHT = 60
const HORIZONTAL_PADDING = 16
const EXTRA_BOTTOM_SPACE = 24

export function Screen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets()
  const paddingBottom = TAB_BAR_HEIGHT + insets.bottom + EXTRA_BOTTOM_SPACE

  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: HORIZONTAL_PADDING,
        paddingBottom,
        justifyContent: 'flex-start',
      }}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: HORIZONTAL_PADDING,
        paddingBottom,
      }}
    >
      {children}
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  )
}
