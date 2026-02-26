import { useLocalSearchParams } from 'expo-router'
import { UserRole } from '@wrcb/cb-common'
import { useAuth } from '@/contexts/AuthContext'
import { OrderChat } from '@/components/order/OrderChat'

export default function OrderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()

  return (
    <OrderChat
      orderId={id!}
      currentUserId={user!.id}
      currentUserRole={UserRole.Consumer}
      title="Chat com vendedor"
      backHref={`/(tabs)/orders/${id}`}
    />
  )
}
