export type NotificationType =
  | 'DUE_DATE_REMINDER'
  | 'RESERVATION_READY'
  | 'BORROW_APPROVED'
  | 'BOOK_RETURNED'
  | 'WISHLIST_APPROVED';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  referenceType?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: AppNotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
