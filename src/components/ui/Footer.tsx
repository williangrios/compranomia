import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { components } from '@/theme'

export function Footer() {
  return (
    <View style={components.footer.container}>
      <FooterItem icon="home-outline" label="Início" />
      <FooterItem icon="search-outline" label="Busca" />
      <FooterItem icon="receipt-outline" label="Pedidos" />
      <FooterItem icon="person-outline" label="Perfil" />
    </View>
  )
}

function FooterItem({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={components.footer.item}>
      <Ionicons name={icon} size={22} color="#FFFFFF" />
      <Text style={components.footer.label}>{label}</Text>
    </Pressable>
  )
}
