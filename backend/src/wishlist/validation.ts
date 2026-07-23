import { z } from 'zod';

export const addToWishlistSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required')
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
