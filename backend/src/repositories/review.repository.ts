import { prisma } from '../config/prisma';
import { Review } from '@prisma/client';

export interface CreateReviewInput {
  userId: string;
  bookId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export class ReviewRepository {
  async create(data: CreateReviewInput): Promise<Review> {
    return prisma.review.create({
      data,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      }
    } as any);
  }

  async findById(id: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      }
    } as any);
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      }
    } as any);
  }

  async findByBookId(bookId: string, limit: number = 10, offset: number = 0): Promise<Review[]> {
    return prisma.review.findMany({
      where: { bookId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    } as any);
  }

  async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<Review[]> {
    return prisma.review.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    } as any);
  }

  async countByBookId(bookId: string): Promise<number> {
    return prisma.review.count({ where: { bookId } });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.review.count({ where: { userId } });
  }

  async getAverageRating(bookId: string): Promise<{ average: number; count: number }> {
    const result = await prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: true
    });

    return {
      average: result._avg.rating || 0,
      count: result._count
    };
  }

  async getRatingDistribution(bookId: string): Promise<Record<number, number>> {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true }
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating]++;
    });

    return distribution;
  }

  async update(id: string, data: UpdateReviewInput): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      }
    } as any);
  }

  async delete(id: string): Promise<Review> {
    return prisma.review.delete({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true } }
      }
    } as any);
  }
}

export const reviewRepository = new ReviewRepository();
