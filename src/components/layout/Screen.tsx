import { View, ScrollView } from 'react-native'
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

  if (scroll) {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{
          flex: 1,
          backgroundColor: colors.background, // 🔑 remove cinza
        }}
        contentContainerStyle={{
          flexGrow: 1, // 🔑 ocupa tela inteira
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: HORIZONTAL_PADDING,
          paddingBottom,
          justifyContent: 'flex-start', // 🔑 conteúdo no topo
        }}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background, // 🔑 remove cinza
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: HORIZONTAL_PADDING,
        paddingBottom,
      }}
    >
      {children}
    </View>
  )
}
