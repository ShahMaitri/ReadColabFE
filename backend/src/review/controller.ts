import { Request, Response } from 'express';
import { reviewService } from './service';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';
import { createReviewSchema, updateReviewSchema } from './validation';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { bookId, rating, comment } = createReviewSchema.parse(req.body);
  const userId = (req as any).user.id;

  const review = await reviewService.createReview({ userId, bookId, rating, comment });

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review
  });
});

export const getReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await reviewService.getReview(id);

  res.json({
    success: true,
    message: 'Review retrieved',
    data: review
  });
});

export const getBookReviews = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await reviewService.getBookReviews(bookId, page, limit);

  res.json({
    success: true,
    message: 'Book reviews retrieved',
    data: result.data,
    pagination: {
      total: result.total,
      page,
      limit,
      pages: result.pages
    }
  });
});

export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await reviewService.getUserReviews(userId, page, limit);

  res.json({
    success: true,
    message: 'User reviews retrieved',
    data: result.data,
    pagination: {
      total: result.total,
      page,
      limit,
      pages: result.pages
    }
  });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateReviewSchema.parse(req.body);
  const userId = (req as any).user.id;

  const review = await reviewService.updateReview(id, userId, data);

  res.json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const review = await reviewService.deleteReview(id, userId);

  res.status(204).json({
    success: true,
    message: 'Review deleted successfully',
    data: review
  });
});

export const getBookRating = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const rating = await reviewService.getBookRating(bookId);

  res.json({
    success: true,
    message: 'Book rating retrieved',
    data: rating
  });
});

export default {
  createReview,
  getReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getBookRating
};
