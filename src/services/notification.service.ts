// services/notification.service.ts
import { UserRole } from '@wrcb/cb-common'
import api from './api'

export interface NotificationItem {
  id: string
  subject: string
  title: string
  message: string
  subjectId?: string
  isRead: boolean
  data?: Record<string, any>
  createdAt: string
  destinationRole: UserRole
}

export const notificationService = {
  async hasUnread(): Promise<{ hasUnread: boolean }> {
    const response = await api.get('/api/notifications/unread/check')
    return response.data.data
  },

  async getNotifications(
    page = 1,
  ): Promise<{ notifications: NotificationItem[] }> {
    const response = await api.get('/api/notifications', {
      params: { page },
    })
    return response.data.data
  },

  async getById(
    notificationId: string,
  ): Promise<{ notification: NotificationItem }> {
    const response = await api.get(`/api/notifications/${notificationId}`)
    return response.data.data
  },

  async markAsRead(notificationId: string): Promise<void> {
    console.log('[notificationService] markAsRead() id:', notificationId)
    await api.patch(`/api/notifications/${notificationId}/read`)
    console.log('[notificationService] markAsRead success')
  },
}
