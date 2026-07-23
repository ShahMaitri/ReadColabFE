import { Notification, PrismaClient, Prisma } from '@prisma/client';

interface ListNotificationOptions {
  skip?: number;
  take?: number;
  unreadOnly?: boolean;
}

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async findByDedupeKey(dedupeKey: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { dedupeKey }
    });
  }

  async listByUserId(
    userId: string,
    options: ListNotificationOptions = {}
  ): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(options.unreadOnly ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      skip: options.skip,
      take: options.take
    });
  }

  async countByUserId(userId: string, unreadOnly: boolean = false): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {})
      }
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return result.count;
  }
}
