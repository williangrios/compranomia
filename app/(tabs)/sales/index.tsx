// app/(tabs)/sales/index.tsx
import { OrdersListScreen } from '@/components/order/OrdersListScreen'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { useRouter } from 'expo-router'

export default function Sales() {
  const router = useRouter()
  return (
    <OrdersListScreen
      getDisplayName={(order: any) =>
        order.customerId?.name
          ? capitalizeFullName(order.customerId.name)
          : order.customerId?.name
            ? capitalizeFullName(order.customerId.name)
            : 'Cliente'
      }
      emptyTitle="Nenhuma venda realizada.."
      emptySubtitle="Quando você receber pedidos, eles aparecerão aqui"
      emptyIcon="receipt-outline"
      onViewOrder={(id) => router.push(`/(tabs)/sales/${id}`)}
      onOpenChat={(id) => router.push(`/(tabs)/sales/${id}?tab=chat`)}
      type="sales"
    />
  )
}
