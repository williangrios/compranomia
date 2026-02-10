import { View, Text, Alert } from 'react-native'
import { Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@wrcb/cb-common'
import { colors } from '@/theme'
import { Screen } from '@/components/layout/Screen'
import { capitalizeFullName } from '@/utils/capitalizeFullName'

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
    <Screen>
      {/* User Info */}
      <View
        style={{
          padding: 20,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          alignItems: 'center',
          marginBottom: 20,
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
          {user?.name || capitalizeFullName(user?.nickName)}
        </Text>

        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {user?.email}
        </Text>

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
            {isSeller ? 'Vendedor' : 'Cliente'}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <ProfileMenuItem
        icon="person"
        title="Dados Pessoais"
        subtitle="Nome, CPF, telefone"
        onPress={() => router.push('/profile/personal-data')}
        showBadge={!user?.isPersonalDataProvided}
      />

      <ProfileMenuItem
        icon="location"
        title="Endereços"
        subtitle="Gerenciar meus endereços de entrega"
        onPress={() => router.push('/profile/addresses')}
      />

      <ProfileMenuItem
        icon="lock-closed"
        title="Alterar senha"
        subtitle="Alterar sua senha de acesso"
        onPress={() => router.push('/profile/update-password')}
        showBadge={!user?.isPersonalDataProvided}
      />

      <ProfileMenuItem
        icon="document-text"
        title="Política de Privacidade"
        subtitle="Como seus dados são utilizados"
        onPress={() =>
          Linking.openURL('https://compranomia.com.br/privacy-policy')
        }
      />

      <ProfileMenuItem
        icon="shield-checkmark"
        title="Termos e Condições"
        subtitle="Regras de uso da plataforma"
        onPress={() =>
          Linking.openURL('https://compranomia.com.br/terms-and-conditions')
        }
      />

      {/* Logout */}
      <View>
        <ProfileMenuItem
          icon="log-out"
          title="Sair"
          onPress={handleLogout}
          isDestructive
        />
      </View>
    </Screen>
  )
}
