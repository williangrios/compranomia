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
      emptyTitle="Nenhuma venda realizada com o status selecionado"
      emptySubtitle="Já experimentou procurar com outro status? Pode haver vendas com outro status."
      emptyIcon="receipt-outline"
      onViewOrder={(id) => router.push(`/(tabs)/sales/${id}`)}
      onOpenChat={(id) => router.push(`/(tabs)/sales/${id}/chat`)}
      type="sales"
    />
  )
}
