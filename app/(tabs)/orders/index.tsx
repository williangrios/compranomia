// app/(tabs)/orders/index.tsx
import { useState } from 'react'
import { OrdersListScreen } from '@/components/order/OrdersListScreen'
import { RatingModal } from '@/components/order/RatingModal'
import { capitalizeFullName } from '@/utils/capitalizeFullName'
import { useRouter } from 'expo-router'

export default function Orders() {
  const router = useRouter()
  const [ratingModal, setRatingModal] = useState<{
    visible: boolean
    orderId: string
    sellerId: string
    sellerName: string
  }>({
    visible: false,
    orderId: '',
    sellerId: '',
    sellerName: '',
  })

  const handleRateOrder = (
    orderId: string,
    sellerId: string,
    sellerName: string,
  ) => {
    setRatingModal({
      visible: true,
      orderId,
      sellerId,
      sellerName: capitalizeFullName(sellerName),
    })
  }

  const handleCloseRating = () => {
    setRatingModal({
      visible: false,
      orderId: '',
      sellerId: '',
      sellerName: '',
    })
  }

  const handleRatingSubmitted = () => {
    // Atualização otimista já acontece no backend (wasRated = true)
    // Aqui você pode forçar um refresh se quiser
  }

  return (
    <>
      <OrdersListScreen
        getDisplayName={(order: any) =>
          order.sellerId?.nickName
            ? capitalizeFullName(order.sellerId.nickName)
            : 'Vendedor'
        }
        emptyTitle="Nenhuma compra realizada com o status selecionado"
        emptySubtitle="Já tentou procurar com outro status? O vendedor pode ter alterado o status de sua compra."
        emptyIcon="ShoppingCart"
        onViewOrder={(id) => router.push(`/(tabs)/orders/${id}`)}
        onOpenChat={(id) => router.push(`/(tabs)/orders/${id}/chat`)}
        onRateOrder={handleRateOrder}
        type="orders"
      />

      <RatingModal
        visible={ratingModal.visible}
        onClose={handleCloseRating}
        orderId={ratingModal.orderId}
        sellerId={ratingModal.sellerId}
        sellerName={ratingModal.sellerName}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  )
}
