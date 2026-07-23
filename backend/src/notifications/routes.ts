import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
} from './controller';

const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, getNotifications);
notificationsRouter.get('/unread-count', authenticate, getUnreadCount);
notificationsRouter.patch('/read-all', authenticate, markAllNotificationsRead);
notificationsRouter.patch('/:id/read', authenticate, markNotificationRead);

export { notificationsRouter };
