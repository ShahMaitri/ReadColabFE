import { apiClient } from '../api/axios';
import type { AppNotification, NotificationListResponse } from '../types/notification';

interface ListNotificationsOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationService = {
  async list(options: ListNotificationsOptions = {}): Promise<NotificationListResponse> {
    const response = await apiClient.get<NotificationListResponse>('/notifications', {
      params: {
        page: options.page || 1,
        limit: options.limit || 20,
        unreadOnly: options.unreadOnly || false
      }
    });

    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { unreadCount: number };
    }>('/notifications/unread-count');

    return response.data.data.unreadCount;
  },

  async markRead(id: string): Promise<AppNotification> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: AppNotification;
    }>(`/notifications/${id}/read`);

    return response.data.data;
  },

  async markAllRead(): Promise<number> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { updatedCount: number };
    }>('/notifications/read-all');

    return response.data.data.updatedCount;
  }
};
