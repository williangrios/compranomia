// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from 'expo-router'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@wrcb/cb-common'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const { user } = useAuth()
  const isSeller = user?.role === UserRole.Seller
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          backgroundColor: '#F97316',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (router.canDismiss()) {
            router.dismissAll()
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="House"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Busca',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="Search"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="ShoppingCart"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Vendas',
          href: isSeller ? '/sales' : null,
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="Receipt"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Loja',
          href: isSeller ? '/dashboard' : null,
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="Store"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificações',
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="BarChart3"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              icon="User"
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 1.5}
            />
          ),
        }}
      />
    </Tabs>
  )
}
