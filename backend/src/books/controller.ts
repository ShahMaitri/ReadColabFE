import { Request, Response, NextFunction } from 'express';
import { bookService } from './service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { createBookSchema, updateBookSchema, getBooksQuerySchema } from './book.validation';

export const createBook = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const validatedData = createBookSchema.parse(req.body);
    const userId = (req as any).user?.sub;

    const book = await bookService.createBook({
      ...validatedData,
      addedBy: userId
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  }
);

export const getBooks = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = getBooksQuerySchema.parse(req.query);

    const result = await bookService.getBooks(
      query.page,
      query.limit,
      query.search,
      query.category,
      query.sortBy,
      query.sortOrder
    );

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: result
    });
  }
);

export const getBook = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const book = await bookService.getBook(id);

    res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book
    });
  }
);

export const updateBook = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const validatedData = updateBookSchema.parse(req.body);

    const book = await bookService.updateBook(id, validatedData);

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  }
);

export const deleteBook = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await bookService.deleteBook(id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  }
);

export const uploadCover = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const book = await bookService.uploadCover(id, `/uploads/covers/${req.file.filename}`);

    res.status(200).json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: book
    });
  }
);

export const generateQRCode = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    // Verify book exists
    await bookService.getBook(id);

    const qrCode = await bookService.generateQRCode(id);

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: { qrCode }
    });
  }
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const categories = await bookService.getCategories();

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  }
);

export const searchBooks = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    const books = await bookService.searchBooks(q, parseInt(limit as string) || 10);

    res.status(200).json({
      success: true,
      message: 'Books found',
      data: books
    });
  }
);
