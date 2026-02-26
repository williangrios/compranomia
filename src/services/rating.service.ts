// services/rating.service.ts
import api from './api'

interface CreateRatingPayload {
  targetId: string
  orderId: string
  text: string
  criteriaCount: number
  criteria: Record<string, number>
}

export const ratingService = {
  async createRating(payload: CreateRatingPayload) {
    const response = await api.post('/api/interactions/ratings', payload)
    return response.data.data
  },
}
