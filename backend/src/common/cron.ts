import cron from 'node-cron';
import { logger } from '../config/logger';
import { NotificationService } from '../notifications';

export const registerCronJobs = (): void => {
  // Heartbeat to confirm scheduler is active.
  cron.schedule('0 * * * *', () => {
    logger.info('Cron heartbeat executed');
  });

  // Daily due-date reminder notifications.
  cron.schedule('0 9 * * *', async () => {
    try {
      const created = await NotificationService.runDueDateReminderJob();
      logger.info(`Due-date reminder job completed. Notifications created: ${created}`);
    } catch (error) {
      logger.error('Due-date reminder job failed', { error });
    }
  });

  // Check wishlist items for newly available books.
  cron.schedule('0 */2 * * *', async () => {
    try {
      const created = await NotificationService.runWishlistAvailabilityJob();
      logger.info(`Wishlist availability job completed. Notifications created: ${created}`);
    } catch (error) {
      logger.error('Wishlist availability job failed', { error });
    }
  });
};
