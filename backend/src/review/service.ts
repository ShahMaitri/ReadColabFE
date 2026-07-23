import { Review } from '@prisma/client';
import { prisma } from '../config/prisma';
import { bookRepository } from '../repositories/book.repository';
import {
  reviewRepository,
  CreateReviewInput,
  UpdateReviewInput
} from '../repositories/review.repository';
import { AppError } from '../utils/appError';
import { AdminReviewQueryInput, ReviewQueryInput } from './validation';
import { ReviewRatingSummaryDTO } from './dtos';

export interface CreateReviewServiceInput extends CreateReviewInput {
  userRole?: string;
}

export interface ReviewEligibilityResult {
  canWriteReview: boolean;
  hasExistingReview: boolean;
  reason?: string;
}

export class ReviewService {
  private async ensureEligibleToReview(userId: string, bookId: string, userRole?: string): Promise<void> {
    if (userRole !== 'EMPLOYEE') {
      throw new AppError('Only employees can submit reviews', 403);
    }

    const completedBorrow = await prisma.borrow.findFirst({
      where: {
        userId,
        bookId,
        status: 'RETURNED'
      }
    });

    if (!completedBorrow) {
      throw new AppError('You can only review books you have borrowed and returned', 403);
    }
  }

  private normalizeRating(value?: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 0;
    }

    return value;
  }

  private buildReviewStats(ratingSummary: { average: number; count: number }, distribution: Record<number, number>): ReviewRatingSummaryDTO {
    return {
      averageRating: Math.round(ratingSummary.average * 10) / 10,
      totalReviews: ratingSummary.count,
      distribution
    };
  }

  private async getBookStats(bookId: string): Promise<ReviewRatingSummaryDTO> {
    const [ratingSummary, distribution] = await Promise.all([
      reviewRepository.getAverageRating(bookId),
      reviewRepository.getRatingDistribution(bookId)
    ]);

    return this.buildReviewStats(ratingSummary, distribution);
  }

  async createReview(data: CreateReviewServiceInput): Promise<Review> {
    // Validate book exists
    const book = await bookRepository.findById(data.bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    await this.ensureEligibleToReview(data.userId, data.bookId, data.userRole);

    // Check if user already reviewed this book
    const existingReview = await reviewRepository.findByUserAndBook(data.userId, data.bookId);
    if (existingReview) {
      throw new AppError('You have already reviewed this book', 409);
    }

    // Validate rating
    if (this.normalizeRating(data.rating) < 1 || this.normalizeRating(data.rating) > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    return reviewRepository.create(data);
  }

  async getReviewEligibility(
    userId: string,
    userRole: string,
    bookId: string
  ): Promise<ReviewEligibilityResult> {
    const book = await bookRepository.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (userRole !== 'EMPLOYEE') {
      return {
        canWriteReview: false,
        hasExistingReview: false,
        reason: 'Only employees can submit reviews.'
      };
    }

    const existingReview = await reviewRepository.findByUserAndBook(userId, bookId);
    if (existingReview) {
      return {
        canWriteReview: true,
        hasExistingReview: true
      };
    }

    const completedBorrow = await prisma.borrow.findFirst({
      where: {
        userId,
        bookId,
        status: 'RETURNED'
      }
    });

    if (!completedBorrow) {
      return {
        canWriteReview: false,
        hasExistingReview: false,
        reason: 'You can review this book only after borrowing and returning it.'
      };
    }

    return {
      canWriteReview: true,
      hasExistingReview: false
    };
  }

  async getReview(id: string): Promise<Review> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    return review;
  }

  async getBookReviews(
    bookId: string,
    query: ReviewQueryInput
  ): Promise<{ data: Review[]; total: number; pages: number }> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const rating = query.rating;
    const sortBy = query.sortBy;
    const search = query.search?.trim();

    const where = {
      ...(typeof rating === 'number' ? { rating } : {}),
      ...(search
        ? {
            OR: [
              { comment: { contains: search, mode: 'insensitive' as const } },
              { user: { name: { contains: search, mode: 'insensitive' as const } } }
            ]
          }
        : {})
    };

    const [reviews, total] = await Promise.all([
      reviewRepository.findByBookId(bookId, {
        skip: offset,
        take: limit,
        sortBy,
        where
      }),
      reviewRepository.count({ bookId, ...where })
    ]);

    return {
      data: reviews,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async getUserReviews(
    userId: string,
    query: ReviewQueryInput
  ): Promise<{ data: Review[]; total: number; pages: number }> {
    const page = query.page;
    const limit = query.limit;
    const sortBy = query.sortBy;
    const rating = query.rating;
    const search = query.search?.trim();
    const offset = (page - 1) * limit;

    const where = {
      ...(typeof rating === 'number' ? { rating } : {}),
      ...(search
        ? {
            OR: [
              { comment: { contains: search, mode: 'insensitive' as const } },
              { book: { title: { contains: search, mode: 'insensitive' as const } } }
            ]
          }
        : {})
    };

    const [reviews, total] = await Promise.all([
      reviewRepository.findByUserId(userId, {
        skip: offset,
        take: limit,
        sortBy,
        where
      }),
      reviewRepository.count({ userId, ...where })
    ]);

    return {
      data: reviews,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async updateReview(id: string, userId: string, data: UpdateReviewInput): Promise<Review> {
    const review = await this.getReview(id);

    // Check ownership
    if (review.userId !== userId) {
      throw new AppError('Unauthorized to update this review', 403);
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    return reviewRepository.update(id, data);
  }

  async deleteReview(id: string, userId?: string, isAdmin = false): Promise<Review> {
    const review = await this.getReview(id);

    // Check ownership unless admin
    if (!isAdmin && review.userId !== userId) {
      throw new AppError('Unauthorized to delete this review', 403);
    }

    return reviewRepository.delete(id);
  }

  async getBookRating(bookId: string): Promise<{ averageRating: number; totalReviews: number; distribution: Record<number, number> }> {
    // Verify book exists
    const book = await bookRepository.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const stats = await this.getBookStats(bookId);

    return {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      distribution: stats.distribution
    };
  }

  async getAdminReviews(query: AdminReviewQueryInput): Promise<{ data: Review[]; total: number; pages: number }> {
    const offset = (query.page - 1) * query.limit;
    const search = query.search?.trim();

    const where = {
      ...(typeof query.rating === 'number' ? { rating: query.rating } : {}),
      ...(query.bookId ? { bookId: query.bookId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(search
        ? {
            OR: [
              { comment: { contains: search, mode: 'insensitive' as const } },
              { book: { title: { contains: search, mode: 'insensitive' as const } } },
              { user: { name: { contains: search, mode: 'insensitive' as const } } },
              { user: { email: { contains: search, mode: 'insensitive' as const } } }
            ]
          }
        : {})
    };

    const [reviews, total] = await Promise.all([
      reviewRepository.findAll({
        skip: offset,
        take: query.limit,
        sortBy: query.sortBy,
        where
      }),
      reviewRepository.count(where)
    ]);

    return {
      data: reviews,
      total,
      pages: Math.ceil(total / query.limit)
    };
  }
}

export const reviewService = new ReviewService();
