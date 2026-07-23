import { z } from 'zod';

export const borrowRequestSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
});

export const returnBookSchema = z.object({
  borrowId: z.string().cuid('Invalid borrow ID'),
});

export const borrowHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type BorrowRequest = z.infer<typeof borrowRequestSchema>;
export type ReturnBook = z.infer<typeof returnBookSchema>;
export type BorrowHistoryQuery = z.infer<typeof borrowHistoryQuerySchema>;
