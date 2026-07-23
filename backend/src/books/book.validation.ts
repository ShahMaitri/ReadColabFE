import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  publicationDate: z.string().datetime().optional(),
  category: z.string().max(100).optional(),
  quantity: z.number().int().min(1).default(1),
  addedBy: z.string().optional()
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  author: z.string().min(1).max(255).optional(),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  publicationDate: z.string().datetime().optional(),
  category: z.string().max(100).optional(),
  quantity: z.number().int().min(1).optional(),
  availableQuantity: z.number().int().min(0).optional(),
  status: z.enum(['AVAILABLE', 'ARCHIVED', 'OUT_OF_STOCK']).optional()
});

export const getBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['title', 'author', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type GetBooksQuery = z.infer<typeof getBooksQuerySchema>;
