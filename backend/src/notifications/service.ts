import { Notification } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotificationRepository } from '../repositories/notification.repository';
import { AppError } from '../utils/appError';

const notificationRepository = new NotificationRepository(prisma);

type NotificationType =
  | 'DUE_DATE_REMINDER'
  | 'RESERVATION_READY'
  | 'BORROW_APPROVED'
  | 'BOOK_RETURNED'
  | 'WISHLIST_APPROVED';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  dedupeKey?: string;
  metadata?: Record<string, unknown>;
  channel?: 'IN_APP' | 'EMAIL' | 'TEAMS';
}

interface ListNotificationOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export class NotificationService {
  static async createNotification(input: CreateNotificationInput): Promise<Notification | null> {
    if (input.dedupeKey) {
      const existing = await notificationRepository.findByDedupeKey(input.dedupeKey);
      if (existing) {
        return null;
      }
    }

    return notificationRepository.create({
      user: { connect: { id: input.userId } },
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      dedupeKey: input.dedupeKey,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      channel: input.channel || 'IN_APP',
      deliveryStatus: 'PENDING'
    });
  }

  static async listForUser(userId: string, options: ListNotificationOptions = {}) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      notificationRepository.listByUserId(userId, {
        skip,
        take: limit,
        unreadOnly: options.unreadOnly
      }),
      notificationRepository.countByUserId(userId, Boolean(options.unreadOnly))
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.countByUserId(userId, true);
  }

  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      return await notificationRepository.markAsRead(notificationId, userId);
    } catch (_error) {
      throw new AppError('Notification not found', 404);
    }
  }

  static async markAllAsRead(userId: string): Promise<number> {
    return notificationRepository.markAllAsRead(userId);
  }

  static async notifyBorrowApproved(borrow: {
    id: string;
    userId: string;
    dueDate: Date | null;
    book?: { title?: string | null } | null;
  }): Promise<void> {
    await NotificationService.createNotification({
      userId: borrow.userId,
      type: 'BORROW_APPROVED',
      title: 'Borrow Approved',
      message: `Your borrow request for "${borrow.book?.title || 'book'}" was approved.`,
      referenceType: 'BORROW',
      referenceId: borrow.id,
      dedupeKey: `borrow-approved:${borrow.id}`,
      metadata: {
        borrowId: borrow.id,
        dueDate: borrow.dueDate?.toISOString() || null
      }
    });
  }

  static async notifyBookReturned(borrow: {
    id: string;
    userId: string;
    book?: { title?: string | null } | null;
  }): Promise<void> {
    await NotificationService.createNotification({
      userId: borrow.userId,
      type: 'BOOK_RETURNED',
      title: 'Book Returned',
      message: `Your return for "${borrow.book?.title || 'book'}" has been recorded.`,
      referenceType: 'BORROW',
      referenceId: borrow.id,
      dedupeKey: `book-returned:${borrow.id}`,
      metadata: {
        borrowId: borrow.id
      }
    });
  }

  static async notifyReservationReady(reservation: {
    id: string;
    userId: string;
    book?: { title?: string | null } | null;
  }): Promise<void> {
    await NotificationService.createNotification({
      userId: reservation.userId,
      type: 'RESERVATION_READY',
      title: 'Reservation Ready',
      message: `"${reservation.book?.title || 'Your reserved book'}" is now ready for pickup.`,
      referenceType: 'RESERVATION',
      referenceId: reservation.id,
      dedupeKey: `reservation-ready:${reservation.id}`,
      metadata: {
        reservationId: reservation.id
      }
    });
  }

  static async runDueDateReminderJob(): Promise<number> {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const borrows = await prisma.borrow.findMany({
      where: {
        status: {
          in: ['APPROVED', 'BORROWED']
        },
        dueDate: {
          gte: now,
          lte: next24Hours
        }
      },
      include: {
        book: {
          select: {
            title: true
          }
        }
      }
    });

    let createdCount = 0;

    for (const borrow of borrows) {
      if (!borrow.dueDate) {
        continue;
      }

      const result = await NotificationService.createNotification({
        userId: borrow.userId,
        type: 'DUE_DATE_REMINDER',
        title: 'Due Date Reminder',
        message: `"${borrow.book.title}" is due on ${borrow.dueDate.toLocaleDateString()}.`,
        referenceType: 'BORROW',
        referenceId: borrow.id,
        dedupeKey: `due-reminder:${borrow.id}:${borrow.dueDate.toISOString().split('T')[0]}`,
        metadata: {
          borrowId: borrow.id,
          dueDate: borrow.dueDate.toISOString()
        }
      });

      if (result) {
        createdCount++;
      }
    }

    return createdCount;
  }

  static async runWishlistAvailabilityJob(): Promise<number> {
    const wishlistItems = await prisma.wishlist.findMany({
      include: {
        book: {
          select: {
            id: true,
            title: true,
            availableQuantity: true,
            status: true
          }
        }
      }
    });

    let createdCount = 0;

    for (const item of wishlistItems) {
      if (item.book.availableQuantity <= 0 || item.book.status !== 'AVAILABLE') {
        continue;
      }

      const result = await NotificationService.createNotification({
        userId: item.userId,
        type: 'WISHLIST_APPROVED',
        title: 'Wishlist Approved',
        message: `"${item.book.title}" is now available to borrow.`,
        referenceType: 'WISHLIST',
        referenceId: item.id,
        dedupeKey: `wishlist-approved:${item.id}`,
        metadata: {
          wishlistId: item.id,
          bookId: item.book.id
        }
      });

      if (result) {
        createdCount++;
      }
    }

    return createdCount;
  }
}
