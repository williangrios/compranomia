// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { UserRole } from '@wrcb/cb-common'
import { useAuth } from '@/contexts/AuthContext'
import { components } from '@/theme'

export default function TabsLayout() {
  const { user } = useAuth()
  const isSeller = user?.role === UserRole.Seller

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: components.tabBar.container,
        tabBarLabelStyle: components.tabBar.label,
        tabBarActiveTintColor: components.tabBar.active.color,
        tabBarInactiveTintColor: components.tabBar.inactive.color,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <View style={components.tabBar.iconWrapper}>
              {focused && <View style={components.tabBar.active.indicator} />}
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={
                  focused
                    ? components.tabBar.active.iconSize
                    : components.tabBar.inactive.iconSize
                }
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Busca - apenas para Consumers */}
      {!isSeller && (
        <Tabs.Screen
          name="busca"
          options={{
            title: 'Busca',
            tabBarIcon: ({ focused, color }) => (
              <View style={components.tabBar.iconWrapper}>
                {focused && <View style={components.tabBar.active.indicator} />}
                <Ionicons
                  name={focused ? 'search' : 'search-outline'}
                  size={
                    focused
                      ? components.tabBar.active.iconSize
                      : components.tabBar.inactive.iconSize
                  }
                  color={color}
                />
              </View>
            ),
          }}
        />
      )}

      {/* Dashboard - apenas para Sellers */}
      {isSeller && (
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused, color }) => (
              <View style={components.tabBar.iconWrapper}>
                {focused && <View style={components.tabBar.active.indicator} />}
                <Ionicons
                  name={focused ? 'stats-chart' : 'stats-chart-outline'}
                  size={
                    focused
                      ? components.tabBar.active.iconSize
                      : components.tabBar.inactive.iconSize
                  }
                  color={color}
                />
              </View>
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ focused, color }) => (
            <View style={components.tabBar.iconWrapper}>
              {focused && <View style={components.tabBar.active.indicator} />}
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={
                  focused
                    ? components.tabBar.active.iconSize
                    : components.tabBar.inactive.iconSize
                }
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <View style={components.tabBar.iconWrapper}>
              {focused && <View style={components.tabBar.active.indicator} />}
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={
                  focused
                    ? components.tabBar.active.iconSize
                    : components.tabBar.inactive.iconSize
                }
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
