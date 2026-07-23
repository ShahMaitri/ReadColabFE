// import QRCode from 'qrcode'; // TODO: Install qrcode package - npm install qrcode
import { bookRepository, CreateBookInput, UpdateBookInput, BookFilterOptions, PaginationOptions, SortOptions } from '../repositories/book.repository';
import { AppError } from '../utils/appError';
import { Book } from '@prisma/client';

export class BookService {
  async createBook(data: CreateBookInput): Promise<Book> {
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

    return book;
  }

  async getBook(id: string): Promise<Book> {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    return book;
  }

  async getBooks(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: Book[]; total: number; page: number; limit: number; pages: number }> {
    const pagination: PaginationOptions = { page: Math.max(1, page), limit: Math.min(100, limit) };
    const sort: SortOptions = {
      sortBy: (sortBy as any) || 'createdAt',
      sortOrder
    };
    const filters: BookFilterOptions = {};

    if (search) filters.search = search;
    if (category) filters.category = category;

    const { data, total } = await bookRepository.findAll(pagination, sort, filters);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit)
    };
  }

  async updateBook(id: string, data: UpdateBookInput): Promise<Book> {
    // Verify book exists
    await this.getBook(id);

    // Check ISBN uniqueness if being updated
    if (data.isbn) {
      const existingBook = await bookRepository.findByIsbn(data.isbn);
      if (existingBook && existingBook.id !== id) {
        throw new AppError('Book with this ISBN already exists', 409);
      }
    }

    return bookRepository.update(id, data);
  }

  async deleteBook(id: string): Promise<Book> {
    // Verify book exists
    await this.getBook(id);
    return bookRepository.delete(id);
  }

  async uploadCover(id: string, coverPath: string): Promise<Book> {
    // Verify book exists
    await this.getBook(id);
    return bookRepository.updateCover(id, coverPath);
  }

  async generateQRCode(bookId: string): Promise<string> {
    // TODO: Implement after installing qrcode package
    // const qrData = `${process.env.APP_URL || 'http://localhost:5173'}/books/${bookId}`;
    // return QRCode.toDataURL(qrData, {
    //   errorCorrectionLevel: 'H',
    //   type: 'image/png',
    //   width: 300,
    //   margin: 2,
    //   color: {
    //     dark: '#000000',
    //     light: '#FFFFFF'
    //   }
    // });
    return ''; // Return empty string for now
  }

  async getCategories(): Promise<string[]> {
    return bookRepository.getCategories();
  }

  async searchBooks(query: string, limit: number = 10): Promise<Book[]> {
    const { data } = await bookRepository.findAll(
      { page: 1, limit },
      { sortBy: 'title', sortOrder: 'asc' },
      { search: query }
    );
    return data;
  }
}

export const bookService = new BookService();
