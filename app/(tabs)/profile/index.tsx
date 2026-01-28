// app/(tabs)/profile/index.tsx
import { View, ScrollView, Text, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui/Header'
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@wrcb/cb-common'
import { colors } from '@/theme'

export default function Profile() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const isSeller = user?.role === UserRole.Seller

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout()
        },
      },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        {/* User Info */}
        <View
          style={{
            padding: 20,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32, color: colors.primary }}>
              {user?.name?.charAt(0).toUpperCase() ||
                user?.nickName?.charAt(0).toUpperCase() ||
                '?'}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            {user?.name || user?.nickName}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {user?.email}
          </Text>
          {isSeller && (
            <View
              style={{
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: colors.primary + '20',
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                Vendedor
              </Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={{ marginTop: 20 }}>
          <ProfileMenuItem
            icon="location"
            title="Endereços"
            subtitle="Gerenciar endereços de entrega"
            onPress={() => router.push('/profile/addresses')}
          />

          <ProfileMenuItem
            icon="person"
            title="Dados Pessoais"
            subtitle="Nome, CPF, telefone"
            onPress={() => router.push('/profile/personal-data')}
            showBadge={!user?.isPersonalDataProvided}
          />

          <ProfileMenuItem
            icon="lock-closed"
            title="Alterar senha"
            subtitle="Alterar sua senha de acesso"
            onPress={() => router.push('/profile/update-password')}
            showBadge={!user?.isPersonalDataProvided}
          />

          {isSeller && (
            <>
              <ProfileMenuItem
                icon="storefront"
                title="Perfil do Negócio"
                subtitle="Bio, categoria, localização"
                onPress={() => router.push('/profile/business-profile')}
                showBadge={!user?.isBusinessDataProvided}
              />

              <ProfileMenuItem
                icon="settings"
                title="Configurações do Vendedor"
                subtitle="Horários, taxas de entrega"
                onPress={() => router.push('/profile/seller-settings')}
              />
            </>
          )}
        </View>

        {/* Logout */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <ProfileMenuItem
            icon="log-out"
            title="Sair"
            onPress={handleLogout}
            isDestructive
          />
        </View>
      </ScrollView>
    </View>
  )
}
