// import QRCode from 'qrcode'; // TODO: Install qrcode package - npm install qrcode
import fs from 'fs/promises';
import path from 'path';
import { bookRepository, CreateBookInput, UpdateBookInput, BookFilterOptions, PaginationOptions, SortOptions } from '../repositories/book.repository';
import { AppError } from '../utils/appError';
import { Book } from '@prisma/client';
import { logger } from '../config/logger';
import { reviewRepository } from '../repositories/review.repository';

type BookWithReviewStats = Book & {
  averageRating: number;
  totalReviews: number;
  reviews?: { rating: number }[];
};

const mapBookWithReviewStats = async (book: BookWithReviewStats): Promise<BookWithReviewStats> => {
  const reviewSource = book.reviews || [];
  const totalReviews = reviewSource.length;
  const localAverage = totalReviews > 0
    ? Math.round((reviewSource.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
    : 0;

  if (totalReviews > 0) {
    return {
      ...book,
      averageRating: localAverage,
      totalReviews
    };
  }

  const { average, count } = await reviewRepository.getAverageRating(book.id);

  return {
    ...book,
    averageRating: Math.round(average * 10) / 10,
    totalReviews: count
  };
};

export class BookService {
  private async removeCoverFileIfPresent(coverPath?: string | null): Promise<void> {
    if (!coverPath || !coverPath.startsWith('/uploads/covers/')) {
      return;
    }

    const uploadsCoversDir = path.resolve(process.cwd(), 'uploads', 'covers');
    const targetPath = path.resolve(process.cwd(), coverPath.replace(/^\//, ''));

    if (!targetPath.startsWith(`${uploadsCoversDir}${path.sep}`)) {
      logger.warn(`Skipped deleting cover outside uploads/covers: ${coverPath}`);
      return;
    }

    try {
      await fs.unlink(targetPath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async createBook(data: CreateBookInput): Promise<BookWithReviewStats> {
    // Validate input
    if (!data.title || !data.author) {
      throw new AppError('Title and author are required', 400);
    }

    // Check ISBN uniqueness if provided
    if (data.isbn) {
      const existingBook = await bookRepository.findByIsbn(data.isbn);
      if (existingBook) {
        throw new AppError('Book with this ISBN already exists', 409);
      }
    }

    // Create book
    const book = await bookRepository.create(data);

    // Generate QR code - DISABLED: qrcode package not installed yet
    // try {
    //   const qrCode = await this.generateQRCode(book.id);
    //   await bookRepository.updateQRCode(book.id, qrCode);
    // } catch (error) {
    //   console.error('QR code generation failed:', error);
    //   // Continue even if QR code generation fails
    // }

    return { ...book, averageRating: 0, totalReviews: 0 };
  }

  async getBook(id: string): Promise<BookWithReviewStats> {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return mapBookWithReviewStats(book as BookWithReviewStats);
  }

  async getBooks(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: BookWithReviewStats[]; total: number; page: number; limit: number; pages: number }> {
    const pagination: PaginationOptions = { page: Math.max(1, page), limit: Math.min(100, limit) };
    const sort: SortOptions = {
      sortBy: (sortBy as any) || 'createdAt',
      sortOrder
    };
    const filters: BookFilterOptions = {};

    if (search) filters.search = search;
    if (category) filters.category = category;

    const { data, total } = await bookRepository.findAll(pagination, sort, filters);
    const books = await Promise.all(data.map((book) => mapBookWithReviewStats(book as BookWithReviewStats)));

    return {
      data: books,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit)
    };
  }

  async updateBook(id: string, data: UpdateBookInput): Promise<BookWithReviewStats> {
    // Verify book exists
    await this.getBook(id);

    // Check ISBN uniqueness if being updated
    if (data.isbn) {
      const existingBook = await bookRepository.findByIsbn(data.isbn);
      if (existingBook && existingBook.id !== id) {
        throw new AppError('Book with this ISBN already exists', 409);
      }
    }

    const book = await bookRepository.update(id, data);
    return { ...book, averageRating: 0, totalReviews: 0 };
  }

  async deleteBook(id: string): Promise<BookWithReviewStats> {
    // Verify book exists
    await this.getBook(id);
    const book = await bookRepository.delete(id);
    return { ...book, averageRating: 0, totalReviews: 0 };
  }

  async uploadCover(id: string, coverPath: string): Promise<BookWithReviewStats> {
    // Verify book exists
    await this.getBook(id);
    const book = await bookRepository.updateCover(id, coverPath);
    return { ...book, averageRating: 0, totalReviews: 0 };
  }

  async removeCover(id: string): Promise<BookWithReviewStats> {
    const currentBook = await this.getBook(id);
    const book = await bookRepository.removeCover(id);

    try {
      await this.removeCoverFileIfPresent(currentBook.cover);
    } catch (error) {
      logger.error('Failed to remove cover file from disk', {
        bookId: id,
        coverPath: currentBook.cover,
        error
      });
    }

    return { ...book, averageRating: 0, totalReviews: 0 };
  }

  async generateQRCode(bookId: string): Promise<string> {
    // Generate QR code URL pointing to the book details page
    const bookUrl = `${process.env.APP_URL || 'http://localhost:5175'}/books/${bookId}`;
    
    // Use QR Server API to generate QR code (free service)
    // The QR code is returned as a data URL PNG image
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookUrl)}`;
    
    // For now, return the direct image URL from the QR Server API
    // In production, you might want to cache these or use a local implementation
    return qrApiUrl;
  }

  async getCategories(): Promise<string[]> {
    return bookRepository.getCategories();
  }

  async searchBooks(query: string, limit: number = 10): Promise<BookWithReviewStats[]> {
    const { data } = await bookRepository.findAll(
      { page: 1, limit },
      { sortBy: 'title', sortOrder: 'asc' },
      { search: query }
    );
    return Promise.all(data.map((book) => mapBookWithReviewStats(book as BookWithReviewStats)));
  }
}

export const bookService = new BookService();
