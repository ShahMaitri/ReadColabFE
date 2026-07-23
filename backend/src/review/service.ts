import { reviewRepository, CreateReviewInput, UpdateReviewInput } from '../repositories/review.repository';
import { bookRepository } from '../repositories/book.repository';
import { AppError } from '../utils/appError';
import { Review } from '@prisma/client';

export class ReviewService {
  async createReview(data: CreateReviewInput): Promise<Review> {
    // Validate book exists
    const book = await bookRepository.findById(data.bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if user already reviewed this book
    const existingReview = await reviewRepository.findByUserAndBook(data.userId, data.bookId);
    if (existingReview) {
      throw new AppError('You have already reviewed this book', 409);
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    return reviewRepository.create(data);
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
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Review[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      reviewRepository.findByBookId(bookId, limit, offset),
      reviewRepository.countByBookId(bookId)
    ]);

    return {
      data: reviews,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Review[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      reviewRepository.findByUserId(userId, limit, offset),
      reviewRepository.countByUserId(userId)
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

  async deleteReview(id: string, userId: string): Promise<Review> {
    const review = await this.getReview(id);

    // Check ownership
    if (review.userId !== userId) {
      throw new AppError('Unauthorized to delete this review', 403);
    }

    return reviewRepository.delete(id);
  }

  async getBookRating(bookId: string): Promise<{ average: number; count: number; distribution: Record<number, number> }> {
    // Verify book exists
    await bookRepository.findById(bookId);

    const [ratingData, distribution] = await Promise.all([
      reviewRepository.getAverageRating(bookId),
      reviewRepository.getRatingDistribution(bookId)
    ]);

    return {
      average: Math.round(ratingData.average * 10) / 10,
      count: ratingData.count,
      distribution
    };
  }
}

export const reviewService = new ReviewService();
