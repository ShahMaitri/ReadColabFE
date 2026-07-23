import { Request, Response } from 'express';
import { reviewService } from './service';
import { asyncHandler } from '../utils/asyncHandler';
import { adminReviewQuerySchema, createReviewSchema, reviewQuerySchema, updateReviewSchema } from './validation';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { bookId, rating, comment } = createReviewSchema.parse(req.body);
  const user = (req as any).user;

  const review = await reviewService.createReview({
    userId: user.id,
    userRole: user.role,
    bookId,
    rating,
    comment
  });

  res.status(201).json({
    success: true,
    message: 'Review created successfully.',
    data: review
  });
});

export const getReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await reviewService.getReview(id);

  res.json({
    success: true,
    message: 'Review retrieved successfully.',
    data: review
  });
});

export const getBookReviews = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const query = reviewQuerySchema.parse(req.query);

  const result = await reviewService.getBookReviews(bookId, query);

  res.json({
    success: true,
    message: 'Book reviews retrieved successfully.',
    data: result.data,
    pagination: {
      total: result.total,
      page: query.page,
      limit: query.limit,
      pages: result.pages
    }
  });
});

export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const query = reviewQuerySchema.parse(req.query);

  const result = await reviewService.getUserReviews(userId, query);

  res.json({
    success: true,
    message: 'My reviews retrieved successfully.',
    data: result.data,
    pagination: {
      total: result.total,
      page: query.page,
      limit: query.limit,
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
    message: 'Review updated successfully.',
    data: review
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const review = await reviewService.deleteReview(id, userId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
    data: review
  });
});

export const getBookRating = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const rating = await reviewService.getBookRating(bookId);

  res.json({
    success: true,
    message: 'Book rating retrieved successfully.',
    data: rating
  });
});

export const getReviewEligibility = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const user = (req as any).user;

  const result = await reviewService.getReviewEligibility(user.id, user.role, bookId);

  res.json({
    success: true,
    message: 'Review eligibility retrieved successfully.',
    data: result
  });
});

export const getAdminReviews = asyncHandler(async (req: Request, res: Response) => {
  const query = adminReviewQuerySchema.parse(req.query);
  const result = await reviewService.getAdminReviews(query);

  res.json({
    success: true,
    message: 'Reviews retrieved successfully.',
    data: result.data,
    pagination: {
      total: result.total,
      page: query.page,
      limit: query.limit,
      pages: result.pages
    }
  });
});

export const deleteReviewAsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await reviewService.deleteReview(id, undefined, true);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
    data: review
  });
});

export default {
  createReview,
  getReview,
  getBookReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getBookRating
};
