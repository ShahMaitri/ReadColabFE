import { prisma } from '../config/prisma';
import { Book } from '@prisma/client';

type BookStatus = 'AVAILABLE' | 'ARCHIVED' | 'OUT_OF_STOCK';

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publicationDate?: Date;
  category?: string;
  quantity?: number;
  cover?: string;
  qrCode?: string;
  addedBy?: string;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  publicationDate?: Date;
  category?: string;
  quantity?: number;
  availableQuantity?: number;
  cover?: string;
  status?: BookStatus;
}

export interface BookFilterOptions {
  search?: string;
  category?: string;
  status?: BookStatus;
  author?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  sortBy: 'title' | 'author' | 'createdAt' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export class BookRepository {
  async create(data: CreateBookInput): Promise<Book> {
    return prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        description: data.description,
        publicationDate: data.publicationDate,
        category: data.category,
        quantity: data.quantity || 1,
        availableQuantity: data.quantity || 1,
        cover: data.cover,
        qrCode: data.qrCode,
        addedBy: data.addedBy
      }
    });
  }

  async findById(id: string): Promise<Book | null> {
    return prisma.book.findUnique({
      where: { id },
      include: {
        addedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });
  }

  async findAll(
    pagination: PaginationOptions,
    sort: SortOptions,
    filters: BookFilterOptions
  ): Promise<{ data: Book[]; total: number }> {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { author: { contains: filters.search } },
        { description: { contains: filters.search } }
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.author) {
      where.author = { contains: filters.author };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: {
          [sort.sortBy]: sort.sortOrder
        },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviews: {
            select: { rating: true }
          }
        }
      }),
      prisma.book.count({ where })
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateBookInput): Promise<Book> {
    return prisma.book.update({
      where: { id },
      data,
      include: {
        addedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<Book> {
    return prisma.book.delete({
      where: { id }
    });
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return prisma.book.findUnique({
      where: { isbn }
    });
  }

  async findByQRCode(qrCode: string): Promise<Book | null> {
    return prisma.book.findUnique({
      where: { qrCode }
    });
  }

  async updateQRCode(id: string, qrCode: string): Promise<Book> {
    return prisma.book.update({
      where: { id },
      data: { qrCode }
    });
  }

  async updateCover(id: string, coverUrl: string): Promise<Book> {
    return prisma.book.update({
      where: { id },
      data: { cover: coverUrl }
    });
  }

  async removeCover(id: string): Promise<Book> {
    return prisma.book.update({
      where: { id },
      data: { cover: null }
    });
  }

  async getCategories(): Promise<string[]> {
    const results = await prisma.book.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { category: { not: null } }
    });
    return results.map((r) => r.category).filter(Boolean) as string[];
  }

  async getAvailableCount(id: string): Promise<number> {
    const book = await prisma.book.findUnique({
      where: { id },
      select: { availableQuantity: true }
    });
    return book?.availableQuantity || 0;
  }

  async decrementAvailableQuantity(id: string): Promise<void> {
    await prisma.book.update({
      where: { id },
      data: {
        availableQuantity: {
          decrement: 1
        }
      }
    });
  }

  async incrementAvailableQuantity(id: string): Promise<void> {
    await prisma.book.update({
      where: { id },
      data: {
        availableQuantity: {
          increment: 1
        }
      }
    });
  }

  /**
   * Find books by mood - maps moods to book categories
   * Generated by GitHub Copilot
   */
  async findByMood(mood: string, limit: number = 7): Promise<Book[]> {
    // Mood to category mapping
    const moodCategoryMap: Record<string, string[]> = {
      happy: ['Comedy', 'Self-Help', 'Romance', 'Young Adult', 'Humor'],
      sad: ['Drama', 'Fiction', 'Biography', 'Historical Fiction', 'Poetry'],
      relaxed: ['Fantasy', 'Adventure', 'Travel', 'Children', 'Graphic Novels'],
      adventurous: ['Thriller', 'Mystery', 'Science Fiction', 'Action', 'Horror'],
      thoughtful: ['Philosophy', 'History', 'Science', 'Psychology', 'Essays'],
      motivated: ['Self-Help', 'Business', 'Biography', 'Non-Fiction', 'Autobiography']
    };

    const categories = moodCategoryMap[mood.toLowerCase()] || [];

    if (categories.length === 0) {
      return [];
    }

    return prisma.book.findMany({
      where: {
        status: 'AVAILABLE',
        category: {
          in: categories
        }
      },
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'asc' }
      ],
      include: {
        reviews: {
          select: { rating: true }
        }
      }
    });
  }
}

export const bookRepository = new BookRepository();
