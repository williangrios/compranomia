import api from './api'

export interface DashboardStats {
  ordersByStatus: Record<string, number>
  pendingAction: {
    count: number
    orders: any[]
  }
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  topProducts: {
    productName: string
    quantitySold: number
    revenue: number
  }[]
  period: {
    startDate: string | null
    endDate: string | null
  }
}

export const dashboardService = {
  async getStats(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get(
      '/api/business/compranomia/dashboard/stats',
      { params },
    )

    return response.data.data.stats as DashboardStats
  },
}
