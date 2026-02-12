// app/(tabs)/orders/index.tsx
import { OrdersListScreen } from '@/components/order/OrdersListScreen'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { useRouter } from 'expo-router'

export default function Orders() {
  const router = useRouter()
  return (
    <OrdersListScreen
      getDisplayName={(order: any) =>
        order.sellerId?.nickName
          ? capitalizeFullName(order.sellerId.nickName)
          : 'Vendedor'
      }
      emptyTitle="Nenhuma compra realizada"
      emptySubtitle="Quando você fizer pedidos, eles aparecerão aqui"
      emptyIcon="cart-outline"
      onViewOrder={(id) => router.push(`/(tabs)/orders/${id}`)}
      onOpenChat={(id) => router.push(`/(tabs)/orders/${id}?tab=chat`)}
      type="orders"
    />
  )
}
