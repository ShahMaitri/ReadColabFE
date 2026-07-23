import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { NotificationService } from './service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const unreadOnly = String(req.query.unreadOnly || 'false').toLowerCase() === 'true';

  const result = await NotificationService.listForUser(userId, {
    page,
    limit,
    unreadOnly
  });

  res.json({
    success: true,
    message: 'Notifications retrieved',
    data: result.data,
    pagination: result.pagination
  });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const unreadCount = await NotificationService.getUnreadCount(userId);

  res.json({
    success: true,
    message: 'Unread count retrieved',
    data: { unreadCount }
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const notification = await NotificationService.markAsRead(id, userId);

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const updatedCount = await NotificationService.markAllAsRead(userId);

  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: { updatedCount }
  });
});
