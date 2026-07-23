/**
 * Personal Book Controller
 * Handles HTTP requests for personal book sharing
 */

import { Request, Response, NextFunction } from 'express';
import { PersonalBookService } from './service';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { z } from 'zod';
import { CreatePersonalBookDTO, CreatePersonalBookReviewDTO } from './types';

const prisma = new PrismaClient();
const personalBookService = new PersonalBookService(prisma);

// ==================== Validation Schemas ====================

const createPersonalBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'OLD', 'DAMAGED']).optional().default('GOOD'),
  language: z.string().optional().default('ENGLISH'),
  edition: z.string().optional(),
  location: z.string().optional(),
  visibility: z.enum(['VISIBLE_TO_EVERYONE', 'VISIBLE_TO_DEPARTMENT', 'HIDDEN']).optional()
});

const updatePersonalBookSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'OLD', 'DAMAGED']).optional(),
  language: z.string().optional(),
  edition: z.string().optional(),
  location: z.string().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'RESERVED', 'BORROWED', 'UNAVAILABLE', 'SOLD', 'DONATED']).optional(),
  visibility: z.enum(['VISIBLE_TO_EVERYONE', 'VISIBLE_TO_DEPARTMENT', 'HIDDEN']).optional()
});

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  reviewType: z.enum(['BOOK', 'OWNER', 'BORROW_EXPERIENCE'])
});

// ==================== Personal Books ====================

export const createPersonalBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const validatedBody = createPersonalBookSchema.parse(req.body);
    const body = validatedBody as CreatePersonalBookDTO;

    const book = await personalBookService.createPersonalBook(
      userId,
      body,
      (req as any).coverImage
    );

    res.status(201).json({
      success: true,
      message: 'Personal book created successfully',
      data: book
    });
  }
);

export const getPersonalBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const book = await personalBookService.getPersonalBookWithOwner(id);

    res.status(200).json({
      success: true,
      data: book
    });
  }
);

export const updatePersonalBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const body = updatePersonalBookSchema.parse(req.body);

    const book = await personalBookService.updatePersonalBook(id, userId, body);

    res.status(200).json({
      success: true,
      message: 'Personal book updated successfully',
      data: book
    });
  }
);

export const deletePersonalBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await personalBookService.deletePersonalBook(id, userId);

    res.status(200).json({
      success: true,
      message: 'Personal book deleted successfully'
    });
  }
);

export const getMyPersonalBooks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const books = await personalBookService.getMyPersonalBooks(userId, { page, limit });
    const total = await prisma.personalBook.count({ where: { ownerId: userId } });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }
);

export const searchPersonalBooks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const books = await personalBookService.searchPersonalBooks(userId || '', {
      search: req.query.search as string,
      title: req.query.title as string,
      author: req.query.author as string,
      isbn: req.query.isbn as string,
      category: req.query.category as string,
      condition: req.query.condition as any,
      availability: req.query.availability as any,
      language: req.query.language as string,
      page,
      limit,
      sortBy: (req.query.sortBy as any) || 'createdAt',
      sortOrder: (req.query.sortOrder as any) || 'desc'
    });

    const total = await prisma.personalBook.count({
      where: {
        visibility: { in: ['VISIBLE_TO_EVERYONE', 'VISIBLE_TO_DEPARTMENT'] }
      }
    });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }
);

// ==================== Borrow Requests ====================

export const requestBook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { bookId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const borrowRequest = await personalBookService.requestBook(bookId, userId);

    res.status(201).json({
      success: true,
      message: 'Book request created successfully',
      data: borrowRequest
    });
  }
);

export const approveBorrowRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const borrowRequest = await personalBookService.approveBorrowRequest(id, userId);

    res.status(200).json({
      success: true,
      message: 'Borrow request approved',
      data: borrowRequest
    });
  }
);

export const rejectBorrowRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { id } = req.params;
    const { remarks } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const borrowRequest = await personalBookService.rejectBorrowRequest(id, userId, remarks);

    res.status(200).json({
      success: true,
      message: 'Borrow request rejected',
      data: borrowRequest
    });
  }
);

export const markAsReturned = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const borrowRequest = await personalBookService.markAsReturned(id, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Book marked as returned',
      data: borrowRequest
    });
  }
);

export const getPendingRequests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const requests = await personalBookService.getPendingRequests(userId);

    res.status(200).json({
      success: true,
      data: requests
    });
  }
);

export const getMyBorrowedBooks = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const books = await personalBookService.getMyBorrowedBooks(userId);

    res.status(200).json({
      success: true,
      data: books
    });
  }
);

// ==================== Reviews ====================

export const createReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;
    const { bookId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const validatedBody = createReviewSchema.parse(req.body);
    const body = validatedBody as CreatePersonalBookReviewDTO;

    const review = await personalBookService.createReview(bookId, userId, body);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  }
);

export const getBookReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { bookId } = req.params;

    const reviews = await personalBookService.getBookReviews(bookId);

    res.status(200).json({
      success: true,
      data: reviews
    });
  }
);

// ==================== Owner Profile ====================

export const getOwnerProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ownerId } = req.params;

    const profile = await personalBookService.getOwnerProfile(ownerId);

    res.status(200).json({
      success: true,
      data: profile
    });
  }
);

// ==================== Settings ====================

export const getSettings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const settings = await personalBookService.getSettings(userId);

    res.status(200).json({
      success: true,
      data: settings
    });
  }
);

export const updateSettings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const settings = await personalBookService.updateSettings(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  }
);
