/**
 * Personal Book Repository
 * Handles database operations for personal books
 */

import { PrismaClient } from '@prisma/client';
import {
  IPersonalBook,
  IPersonalBorrowRequest,
  IPersonalBookReview,
  IPersonalBookSharingSettings,
  PersonalBookSearchOptions,
  PersonalBookWithOwner,
  BorrowRequestWithDetails,
  BorrowRequestStatus
} from './types';

export class PersonalBookRepository {
  constructor(private prisma: PrismaClient) {}

  // ==================== Personal Books ====================

  async createPersonalBook(data: any): Promise<IPersonalBook> {
    return this.prisma.personalBook.create({
      data
    }) as Promise<IPersonalBook>;
  }

  async getPersonalBook(id: string): Promise<IPersonalBook | null> {
    return this.prisma.personalBook.findUnique({
      where: { id }
    }) as Promise<IPersonalBook | null>;
  }

  async getPersonalBookWithOwner(id: string): Promise<PersonalBookWithOwner | null> {
    return this.prisma.personalBook.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            borrowRequests: true,
            reviews: true
          }
        }
      }
    }) as Promise<PersonalBookWithOwner | null>;
  }

  async updatePersonalBook(id: string, data: any): Promise<IPersonalBook> {
    return this.prisma.personalBook.update({
      where: { id },
      data
    }) as Promise<IPersonalBook>;
  }

  async deletePersonalBook(id: string): Promise<IPersonalBook> {
    return this.prisma.personalBook.delete({
      where: { id }
    }) as Promise<IPersonalBook>;
  }

  async getPersonalBooksByOwner(ownerId: string, options?: any): Promise<IPersonalBook[]> {
    const take = options?.limit || 10;
    const skip = ((options?.page || 1) - 1) * take;

    return this.prisma.personalBook.findMany({
      where: {
        ownerId,
        ...(options?.visibility && { visibility: options.visibility })
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    }) as Promise<IPersonalBook[]>;
  }

  async searchPersonalBooks(options: PersonalBookSearchOptions): Promise<IPersonalBook[]> {
    const take = options.limit || 10;
    const skip = ((options.page || 1) - 1) * take;

    const where: any = {};

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { author: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    if (options.title) {
      where.title = { contains: options.title, mode: 'insensitive' };
    }
    if (options.author) {
      where.author = { contains: options.author, mode: 'insensitive' };
    }
    if (options.isbn) {
      where.isbn = options.isbn;
    }
    if (options.category) {
      where.category = options.category;
    }
    if (options.condition) {
      where.condition = options.condition;
    }
    if (options.availability) {
      where.availabilityStatus = options.availability;
    }
    if (options.language) {
      where.language = options.language;
    }

    // Visibility filter - show only visible books or owner's own books
    if (!options.ownerId) {
      where.visibility = { in: ['VISIBLE_TO_EVERYONE', 'VISIBLE_TO_DEPARTMENT'] };
    }

    return this.prisma.personalBook.findMany({
      where,
      take,
      skip,
      orderBy: {
        [options.sortBy || 'createdAt']: options.sortOrder || 'desc'
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    }) as Promise<IPersonalBook[]>;
  }

  async getPopularPersonalBooks(limit: number = 10): Promise<IPersonalBook[]> {
    return this.prisma.personalBook.findMany({
      where: {
        visibility: { in: ['VISIBLE_TO_EVERYONE', 'VISIBLE_TO_DEPARTMENT'] }
      },
      take: limit,
      orderBy: {
        borrowCount: 'desc'
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }) as Promise<IPersonalBook[]>;
  }

  async countPersonalBooks(ownerId?: string): Promise<number> {
    return this.prisma.personalBook.count({
      where: ownerId ? { ownerId } : undefined
    });
  }

  // ==================== Borrow Requests ====================

  async createBorrowRequest(data: any): Promise<IPersonalBorrowRequest> {
    return this.prisma.personalBorrowRequest.create({
      data
    }) as Promise<IPersonalBorrowRequest>;
  }

  async getBorrowRequest(id: string): Promise<IPersonalBorrowRequest | null> {
    return this.prisma.personalBorrowRequest.findUnique({
      where: { id }
    }) as Promise<IPersonalBorrowRequest | null>;
  }

  async getBorrowRequestWithDetails(id: string): Promise<BorrowRequestWithDetails | null> {
    return this.prisma.personalBorrowRequest.findUnique({
      where: { id },
      include: {
        book: true,
        owner: {
          select: { id: true, name: true, email: true }
        },
        requester: {
          select: { id: true, name: true, email: true }
        }
      }
    }) as Promise<BorrowRequestWithDetails | null>;
  }

  async updateBorrowRequest(id: string, data: any): Promise<IPersonalBorrowRequest> {
    return this.prisma.personalBorrowRequest.update({
      where: { id },
      data
    }) as Promise<IPersonalBorrowRequest>;
  }

  async getBorrowRequestsByBook(bookId: string): Promise<IPersonalBorrowRequest[]> {
    return this.prisma.personalBorrowRequest.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' }
    }) as Promise<IPersonalBorrowRequest[]>;
  }

  async getBorrowRequestsByOwner(ownerId: string, status?: BorrowRequestStatus): Promise<BorrowRequestWithDetails[]> {
    return this.prisma.personalBorrowRequest.findMany({
      where: {
        ownerId,
        ...(status && { status })
      },
      include: {
        book: true,
        requester: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as Promise<BorrowRequestWithDetails[]>;
  }

  async getBorrowRequestsByRequester(requesterId: string, status?: BorrowRequestStatus): Promise<BorrowRequestWithDetails[]> {
    return this.prisma.personalBorrowRequest.findMany({
      where: {
        requesterId,
        ...(status && { status })
      },
      include: {
        book: true,
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as Promise<BorrowRequestWithDetails[]>;
  }

  async getPendingBorrowRequests(ownerId: string): Promise<BorrowRequestWithDetails[]> {
    return this.getBorrowRequestsByOwner(ownerId, 'PENDING');
  }

  // ==================== Personal Book Reviews ====================

  async createReview(data: any): Promise<IPersonalBookReview> {
    return this.prisma.personalBookReview.create({
      data
    }) as Promise<IPersonalBookReview>;
  }

  async getReview(id: string): Promise<IPersonalBookReview | null> {
    return this.prisma.personalBookReview.findUnique({
      where: { id }
    }) as Promise<IPersonalBookReview | null>;
  }

  async updateReview(id: string, data: any): Promise<IPersonalBookReview> {
    return this.prisma.personalBookReview.update({
      where: { id },
      data
    }) as Promise<IPersonalBookReview>;
  }

  async deleteReview(id: string): Promise<IPersonalBookReview> {
    return this.prisma.personalBookReview.delete({
      where: { id }
    }) as Promise<IPersonalBookReview>;
  }

  async getReviewsByBook(bookId: string): Promise<IPersonalBookReview[]> {
    return this.prisma.personalBookReview.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' }
    }) as Promise<IPersonalBookReview[]>;
  }

  async getAverageRating(bookId: string): Promise<number> {
    const result = await this.prisma.personalBookReview.aggregate({
      where: { bookId },
      _avg: { rating: true }
    });
    return result._avg.rating || 0;
  }

  async userHasReviewed(bookId: string, userId: string, reviewType: string): Promise<boolean> {
    const review = await this.prisma.personalBookReview.findUnique({
      where: {
        bookId_userId_reviewType: {
          bookId,
          userId,
          reviewType: reviewType as any
        }
      }
    });
    return !!review;
  }

  // ==================== Settings ====================

  async getOrCreateSettings(userId: string): Promise<IPersonalBookSharingSettings> {
    let settings = await this.prisma.personalBookSharingSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await this.prisma.personalBookSharingSettings.create({
        data: { userId }
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: any): Promise<IPersonalBookSharingSettings> {
    return this.prisma.personalBookSharingSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });
  }

  // ==================== Analytics ====================

  async getMostSharedEmployees(limit: number = 10): Promise<any[]> {
    const results = await this.prisma.personalBook.findMany({
      select: {
        ownerId: true
      },
      distinct: ['ownerId'],
      take: limit
    });
    return results;
  }

  async getMostBorrowedBooks(limit: number = 10): Promise<any[]> {
    return this.prisma.personalBook.findMany({
      where: {
        visibility: { in: ['VISIBLE_TO_EVERYONE', 'VISIBLE_TO_DEPARTMENT'] }
      },
      take: limit,
      orderBy: {
        borrowCount: 'desc'
      }
    });
  }

  async getAverageBorrowTime(): Promise<number> {
    // Calculate average borrow duration in days
    const results = await this.prisma.personalBorrowRequest.findMany({
      where: {
        returnDate: { not: null },
        borrowDate: { not: null }
      },
      select: {
        borrowDate: true,
        returnDate: true
      }
    });

    if (results.length === 0) return 0;

    const totalDays = results.reduce((sum, req) => {
      if (req.borrowDate && req.returnDate) {
        const days = Math.floor(
          (req.returnDate.getTime() - req.borrowDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }
      return sum;
    }, 0);

    return Math.round(totalDays / results.length);
  }

  async getReturnCompliance(): Promise<number> {
    const total = await this.prisma.personalBorrowRequest.count({
      where: { status: { in: ['RETURNED', 'OVERDUE'] } }
    });

    const returned = await this.prisma.personalBorrowRequest.count({
      where: { status: 'RETURNED' }
    });

    return total > 0 ? Math.round((returned / total) * 100) : 0;
  }
}
