import { Prisma, Review } from '@prisma/client';
import { prisma } from '../config/prisma';

const reviewInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
  book: { select: { id: true, title: true, author: true, cover: true } }
} as const;

export type ReviewWithRelations = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export type ReviewSortOption = 'newest' | 'oldest' | 'highestRating' | 'lowestRating';

export interface ReviewListOptions {
  skip?: number;
  take?: number;
  sortBy?: ReviewSortOption;
  where?: Prisma.ReviewWhereInput;
}

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
  private getOrderBy(sortBy: ReviewSortOption = 'newest'): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'highestRating':
        return [{ rating: 'desc' }, { createdAt: 'desc' }];
      case 'lowestRating':
        return [{ rating: 'asc' }, { createdAt: 'desc' }];
      case 'newest':
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  async create(data: CreateReviewInput): Promise<ReviewWithRelations> {
    return prisma.review.create({
      data,
      include: reviewInclude
    });
  }

  async findById(id: string): Promise<ReviewWithRelations | null> {
    return prisma.review.findUnique({
      where: { id },
      include: reviewInclude
    });
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<ReviewWithRelations | null> {
    return prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: reviewInclude
    });
  }

  async findByBookId(
    bookId: string,
    options: ReviewListOptions = {}
  ): Promise<ReviewWithRelations[]> {
    const {
      skip = 0,
      take = 10,
      sortBy = 'newest',
      where
    } = options;

    return prisma.review.findMany({
      where: { bookId, ...where },
      include: reviewInclude,
      orderBy: this.getOrderBy(sortBy),
      take,
      skip
    });
  }

  async findByUserId(
    userId: string,
    options: ReviewListOptions = {}
  ): Promise<ReviewWithRelations[]> {
    const {
      skip = 0,
      take = 10,
      sortBy = 'newest',
      where
    } = options;

    return prisma.review.findMany({
      where: { userId, ...where },
      include: reviewInclude,
      orderBy: this.getOrderBy(sortBy),
      take,
      skip
    });
  }

  async findAll(options: ReviewListOptions = {}): Promise<ReviewWithRelations[]> {
    const {
      skip = 0,
      take = 20,
      sortBy = 'newest',
      where
    } = options;

    return prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: this.getOrderBy(sortBy),
      take,
      skip
    });
  }

  async count(where: Prisma.ReviewWhereInput = {}): Promise<number> {
    return prisma.review.count({ where });
  }

  async countByBookId(bookId: string): Promise<number> {
    return this.count({ bookId });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.count({ userId });
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

  async update(id: string, data: UpdateReviewInput): Promise<ReviewWithRelations> {
    return prisma.review.update({
      where: { id },
      data,
      include: reviewInclude
    });
  }

  async delete(id: string): Promise<ReviewWithRelations> {
    return prisma.review.delete({
      where: { id },
      include: reviewInclude
    });
  }
}

export const reviewRepository = new ReviewRepository();
