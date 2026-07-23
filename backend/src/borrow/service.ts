import { Borrow } from '@prisma/client';
import { BorrowRepository } from '../repositories/borrow.repository';
import { BookRepository } from '../repositories/book.repository';
import { AppError } from '../utils/appError';
import { prisma } from '../config/prisma';
import { NotificationService } from '../notifications';

const borrowRepository = new BorrowRepository(prisma);
const bookRepository = new BookRepository();

const BORROW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BORROWED: 'BORROWED',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE'
} as const;

const BORROW_DURATION_DAYS = 14; // 2 weeks

export class BorrowService {
  // Request to borrow a book
  static async requestBorrow(userId: string, bookId: string): Promise<Borrow> {
    // Check if book exists
    const book = await bookRepository.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if user already has an active borrow
    const activeBorrow = await borrowRepository.findActiveBorrowByUserAndBook(
      userId,
      bookId
    );
    if (activeBorrow) {
      throw new AppError(
        'You already have an active borrow request for this book',
        409
      );
    }

    // Check book availability
    if (book.availableQuantity <= 0) {
      throw new AppError(
        'Book is currently not available. Please try to reserve it instead.',
        400
      );
    }

    // Create borrow request
    const borrow = await borrowRepository.create({
      userId,
      bookId,
      status: BORROW_STATUS.PENDING,
    });

    return borrow;
  }

  // Approve a borrow request (admin only)
  static async approveBorrow(borrowId: string): Promise<Borrow> {
    const borrow = await borrowRepository.findById(borrowId);
    if (!borrow) {
      throw new AppError('Borrow request not found', 404);
    }

    if (borrow.status !== BORROW_STATUS.PENDING) {
      throw new AppError(
        `Cannot approve borrow with status: ${borrow.status}`,
        400
      );
    }

    const book = await bookRepository.findById(borrow.bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check availability one more time
    if (book.availableQuantity <= 0) {
      // Reject the borrow
      return borrowRepository.updateStatus(borrowId, BORROW_STATUS.REJECTED);
    }

    // Calculate due date
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + BORROW_DURATION_DAYS);

    // Update borrow status
    const updatedBorrow = await borrowRepository.updateStatus(
      borrowId,
      BORROW_STATUS.APPROVED,
      {
        borrowDate,
        dueDate,
      }
    );

    await NotificationService.notifyBorrowApproved(updatedBorrow);

    return updatedBorrow;
  }

  // Reject a borrow request (admin only)
  static async rejectBorrow(borrowId: string): Promise<Borrow> {
    const borrow = await borrowRepository.findById(borrowId);
    if (!borrow) {
      throw new AppError('Borrow request not found', 404);
    }

    if (borrow.status !== BORROW_STATUS.PENDING) {
      throw new AppError(
        `Cannot reject borrow with status: ${borrow.status}`,
        400
      );
    }

    return borrowRepository.updateStatus(borrowId, BORROW_STATUS.REJECTED);
  }

  // Confirm borrow (user picks up the book)
  static async confirmBorrow(borrowId: string): Promise<Borrow> {
    const borrow = await borrowRepository.findById(borrowId);
    if (!borrow) {
      throw new AppError('Borrow request not found', 404);
    }

    if (borrow.status !== BORROW_STATUS.APPROVED) {
      throw new AppError(
        `Borrow must be approved before confirmation. Current status: ${borrow.status}`,
        400
      );
    }

    // Update borrow status to BORROWED
    const updatedBorrow = await borrowRepository.updateStatus(
      borrowId,
      BORROW_STATUS.BORROWED
    );

    // Decrement available quantity
    await bookRepository.decrementAvailableQuantity(borrow.bookId);

    return updatedBorrow;
  }

  // Return a book
  static async returnBook(borrowId: string): Promise<Borrow> {
    const borrow = await borrowRepository.findById(borrowId);
    if (!borrow) {
      throw new AppError('Borrow record not found', 404);
    }

    if (borrow.status !== BORROW_STATUS.BORROWED) {
      throw new AppError(
        `Book must be borrowed to return. Current status: ${borrow.status}`,
        400
      );
    }

    // Increment available quantity
    await bookRepository.incrementAvailableQuantity(borrow.bookId);

    // Update return date and status
    const returnDate = new Date();
    const updatedBorrow = await borrowRepository.updateStatus(
      borrowId,
      BORROW_STATUS.RETURNED,
      { returnDate }
    );

    await NotificationService.notifyBookReturned(updatedBorrow);

    return updatedBorrow;
  }

  // Get user's active borrows
  static async getActiveBorrows(userId: string): Promise<Borrow[]> {
    return borrowRepository.findActiveByUserId(userId);
  }

  // Get user's borrow history
  static async getBorrowHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Borrow[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const { data, total } = await borrowRepository.findAllByUserId(
      userId,
      skip,
      limit
    );

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // Get pending requests for admin
  static async getPendingRequests(page: number = 1, limit: number = 10): Promise<{
    data: Borrow[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const { data, total } = await borrowRepository.findPending(skip, limit);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // Find overdue borrows and update status
  static async updateOverdueBorrows(): Promise<number> {
    const overdueBorrows = await borrowRepository.findOverdue();

    let count = 0;
    for (const borrow of overdueBorrows) {
      await borrowRepository.updateStatus(borrow.id, BORROW_STATUS.OVERDUE);
      count++;
    }

    return count;
  }

  // Get borrow statistics for admin
  static async getStatistics(): Promise<{
    active: number;
    pending: number;
    overdue: number;
    returned: number;
    rejected: number;
  }> {
    const counts = await borrowRepository.countByStatus();

    return {
      active: (counts[BORROW_STATUS.BORROWED] || 0) + (counts[BORROW_STATUS.APPROVED] || 0),
      pending: counts[BORROW_STATUS.PENDING] || 0,
      overdue: counts[BORROW_STATUS.OVERDUE] || 0,
      returned: counts[BORROW_STATUS.RETURNED] || 0,
      rejected: counts[BORROW_STATUS.REJECTED] || 0,
    };
  }

  // Get user's borrows with book details for dashboard
  static async getUserBorrowsWithBooks(userId: string): Promise<any[]> {
    const borrows = await prisma.borrow.findMany({
      where: {
        userId,
        status: {
          in: ['APPROVED', 'BORROWED']
        }
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            category: true,
            quantity: true,
            availableQuantity: true
          }
        }
      },
      orderBy: { borrowDate: 'desc' }
    });

    return borrows;
  }

  // Get books due soon for user (due within 7 days)
  static async getDueSoonBooks(userId: string): Promise<any[]> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueSoonBooks = await prisma.borrow.findMany({
      where: {
        userId,
        status: 'BORROWED',
        dueDate: {
          gte: now,
          lte: sevenDaysFromNow
        }
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            category: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return dueSoonBooks;
  }
}
