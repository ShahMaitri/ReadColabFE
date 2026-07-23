import { z } from 'zod';

export const createReviewSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Comment must be 1000 characters or less').optional()
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional()
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['newest', 'oldest', 'highestRating', 'lowestRating']).default('newest'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  search: z.string().trim().optional()
});

export const adminReviewQuerySchema = reviewQuerySchema.extend({
  bookId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  reportedOnly: z.coerce.boolean().optional()
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
export type AdminReviewQueryInput = z.infer<typeof adminReviewQuerySchema>;
