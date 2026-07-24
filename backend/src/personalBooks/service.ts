/**
 * Personal Book Service
 * Business logic for personal book sharing
 */

import { PrismaClient } from '@prisma/client';
import { PersonalBookRepository } from './repository';
import {
  CreatePersonalBookDTO,
  UpdatePersonalBookDTO,
  CreateBorrowRequestDTO,
  UpdateBorrowRequestDTO,
  MarkAsReturnedDTO,
  CreatePersonalBookReviewDTO,
  IPersonalBook,
  PersonalBookSearchOptions,
  AvailabilityStatus,
  OwnerProfile
} from './types';
import { AppError } from '../utils/appError';
import { NotificationService } from '../notifications/service';

export class PersonalBookService {
  private repository: PersonalBookRepository;

  constructor(private prisma: PrismaClient) {
    this.repository = new PersonalBookRepository(prisma);
  }

  // ==================== Personal Books ====================

  async createPersonalBook(
    ownerId: string,
    data: CreatePersonalBookDTO,
    coverImage?: string
  ): Promise<IPersonalBook> {
    // Check if user has sharing enabled
    const settings = await this.repository.getOrCreateSettings(ownerId);
    if (!settings.sharingEnabled) {
      throw new AppError('Personal book sharing is disabled for this user', 403);
    }

    const personalBook = await this.repository.createPersonalBook({
      ownerId,
      ...data,
      coverImage,
      visibility: data.visibility || 'VISIBLE_TO_EVERYONE'
    });

    return personalBook;
  }

  async getPersonalBook(bookId: string): Promise<IPersonalBook> {
    const book = await this.repository.getPersonalBook(bookId);
    if (!book) {
      throw new AppError('Personal book not found', 404);
    }
    return book;
  }

  async getPersonalBookWithOwner(bookId: string): Promise<any> {
    const book = await this.repository.getPersonalBookWithOwner(bookId);
    if (!book) {
      throw new AppError('Personal book not found', 404);
    }
    return book;
  }

  async updatePersonalBook(
    bookId: string,
    ownerId: string,
    data: UpdatePersonalBookDTO
  ): Promise<IPersonalBook> {
    const book = await this.getPersonalBook(bookId);

    // Verify ownership
    if (book.ownerId !== ownerId) {
      throw new AppError('You can only edit your own books', 403);
    }

    return this.repository.updatePersonalBook(bookId, data);
  }

  async deletePersonalBook(bookId: string, ownerId: string): Promise<void> {
    const book = await this.getPersonalBook(bookId);

    // Verify ownership
    if (book.ownerId !== ownerId) {
      throw new AppError('You can only delete your own books', 403);
    }

    // Check for active borrow requests
    const activeRequests = await this.repository.getPendingBorrowRequests(bookId);
    if (activeRequests.length > 0) {
      throw new AppError(
        'Cannot delete book with active borrow requests. Please reject or fulfill pending requests first.',
        400
      );
    }

    await this.repository.deletePersonalBook(bookId);
  }

  async getMyPersonalBooks(ownerId: string, options?: any): Promise<IPersonalBook[]> {
    return this.repository.getPersonalBooksByOwner(ownerId, options);
  }

  async searchPersonalBooks(
    userId: string,
    options: PersonalBookSearchOptions
  ): Promise<IPersonalBook[]> {
    return this.repository.searchPersonalBooks({
      ...options,
      ownerId: userId
    });
  }

  // ==================== Borrow Requests ====================

  async requestBook(
    bookId: string,
    requesterId: string
  ): Promise<any> {
    const book = await this.getPersonalBook(bookId);

    // Cannot request own book
    if (book.ownerId === requesterId) {
      throw new AppError('You cannot request your own books', 400);
    }

    // Check if already requested - only block if there's an active borrow
    const existingRequest = await this.repository.getBorrowRequestsByBook(bookId);
    const userRequest = existingRequest.find((r) => r.requesterId === requesterId);
    
    if (userRequest) {
      if (userRequest.status === 'PENDING' || userRequest.status === 'APPROVED' || 
          userRequest.status === 'BORROWED' || userRequest.status === 'OVERDUE') {
        throw new AppError('You already have an active request for this book', 400);
      }
      
      // Delete old RETURNED or REJECTED requests to allow new requests
      if (userRequest.status === 'RETURNED' || userRequest.status === 'REJECTED') {
        await this.repository.deleteBorrowRequest(userRequest.id);
      }
    }

    // Check if book is available
    if (book.availabilityStatus !== 'AVAILABLE') {
      throw new AppError('This book is not available for borrowing', 400);
    }

    const borrowRequest = await this.repository.createBorrowRequest({
      bookId,
      ownerId: book.ownerId,
      requesterId,
      status: 'PENDING',
      dueDate: this.calculateDueDate()
    });

    // Check if auto-approve is enabled
    const ownerSettings = await this.repository.getOrCreateSettings(book.ownerId);
    if (ownerSettings.autoApproveRequests) {
      await this.approveBorrowRequest(borrowRequest.id, book.ownerId);
    } else {
      // Notify owner of new request
      await NotificationService.createNotification({
        userId: book.ownerId,
        type: 'DUE_DATE_REMINDER',
        title: 'New Book Request',
        message: `A colleague has requested to borrow "${book.title}"`,
        referenceType: 'PersonalBorrowRequest',
        referenceId: borrowRequest.id
      });
    }

    return borrowRequest;
  }

  async approveBorrowRequest(
    requestId: string,
    ownerId: string,
    dueDate?: Date
  ): Promise<any> {
    const request = await this.repository.getBorrowRequestWithDetails(requestId);
    if (!request) {
      throw new AppError('Borrow request not found', 404);
    }

    // Verify ownership
    if (request.ownerId !== ownerId) {
      throw new AppError('You can only approve requests for your own books', 403);
    }

    const updatedRequest = await this.repository.updateBorrowRequest(requestId, {
      status: 'BORROWED',
      approvedDate: new Date(),
      borrowDate: new Date(),
      dueDate: dueDate || this.calculateDueDate()
    });

    // Update book availability
    await this.repository.updatePersonalBook(request.bookId, {
      availabilityStatus: 'BORROWED'
    });

    // Notify requester
    await NotificationService.createNotification({
      userId: request.requesterId,
      type: 'BORROW_APPROVED',
      title: 'Book Request Approved',
      message: `Your request to borrow "${request.book.title}" has been approved`,
      referenceType: 'PersonalBorrowRequest',
      referenceId: requestId
    });

    return updatedRequest;
  }

  async rejectBorrowRequest(
    requestId: string,
    ownerId: string,
    remarks?: string
  ): Promise<any> {
    const request = await this.repository.getBorrowRequestWithDetails(requestId);
    if (!request) {
      throw new AppError('Borrow request not found', 404);
    }

    // Verify ownership
    if (request.ownerId !== ownerId) {
      throw new AppError('You can only reject requests for your own books', 403);
    }

    const updatedRequest = await this.repository.updateBorrowRequest(requestId, {
      status: 'REJECTED',
      remarks
    });

    // Notify requester
    await NotificationService.createNotification({
      userId: request.requesterId,
      type: 'DUE_DATE_REMINDER',
      title: 'Book Request Rejected',
      message: `Your request to borrow "${request.book.title}" has been rejected`,
      referenceType: 'PersonalBorrowRequest',
      referenceId: requestId
    });

    return updatedRequest;
  }

  async markAsReturned(
    requestId: string,
    requesterId: string,
    data?: MarkAsReturnedDTO
  ): Promise<any> {
    const request = await this.repository.getBorrowRequestWithDetails(requestId);
    if (!request) {
      throw new AppError('Borrow request not found', 404);
    }

    // Verify requester
    if (request.requesterId !== requesterId) {
      throw new AppError('You can only mark your own borrowed books as returned', 403);
    }

    const updatedRequest = await this.repository.updateBorrowRequest(requestId, {
      status: 'RETURNED',
      returnDate: new Date(),
      remarks: data?.remarks
    });

    // Update book availability
    await this.repository.updatePersonalBook(request.bookId, {
      availabilityStatus: 'AVAILABLE'
    });

    // Notify owner
    await NotificationService.createNotification({
      userId: request.ownerId,
      type: 'BOOK_RETURNED',
      title: 'Book Returned',
      message: `${request.requester.name} has returned "${request.book.title}"`,
      referenceType: 'PersonalBorrowRequest',
      referenceId: requestId
    });

    return updatedRequest;
  }

  async getPendingRequests(ownerId: string): Promise<any[]> {
    return this.repository.getPendingBorrowRequests(ownerId);
  }

  async getMyBorrowedBooks(requesterId: string): Promise<any[]> {
    return this.repository.getBorrowRequestsByRequester(requesterId);
  }

  // ==================== Reviews ====================

  async createReview(
    bookId: string,
    userId: string,
    data: CreatePersonalBookReviewDTO
  ): Promise<any> {
    const book = await this.getPersonalBook(bookId);

    // Check if user can review (must have borrowed the book)
    const borrowRequests = await this.repository.getBorrowRequestsByBook(bookId);
    const hasBorrowed = borrowRequests.some(
      (r) => r.requesterId === userId && r.status === 'RETURNED'
    );

    if (!hasBorrowed && data.reviewType !== 'OWNER') {
      throw new AppError('You must have borrowed this book to leave a review', 400);
    }

    // Check if already reviewed
    const hasReviewed = await this.repository.userHasReviewed(
      bookId,
      userId,
      data.reviewType
    );
    if (hasReviewed) {
      throw new AppError('You have already reviewed this book', 400);
    }

    const review = await this.repository.createReview({
      bookId,
      userId,
      rating: data.rating,
      comment: data.comment,
      reviewType: data.reviewType
    });

    // Update average rating
    const avgRating = await this.repository.getAverageRating(bookId);
    await this.repository.updatePersonalBook(bookId, {
      averageRating: avgRating
    });

    // Notify owner of review
    await NotificationService.createNotification({
      userId: book.ownerId,
      type: 'DUE_DATE_REMINDER',
      title: 'New Review',
      message: `Your book "${book.title}" received a new review`,
      referenceType: 'PersonalBookReview',
      referenceId: review.id
    });

    return review;
  }

  async getBookReviews(bookId: string): Promise<any[]> {
    return this.repository.getReviewsByBook(bookId);
  }

  // ==================== Owner Profile ====================

  async getOwnerProfile(ownerId: string): Promise<OwnerProfile> {
    const booksShared = await this.repository.countPersonalBooks(ownerId);
    const borrowRequests = await this.repository.getBorrowRequestsByOwner(ownerId);

    const successfulBorrows = borrowRequests.filter((r) => r.status === 'RETURNED').length;
    const totalBorrows = borrowRequests.filter((r) => r.status !== 'PENDING').length;

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const reviews = await this.prisma.personalBookReview.findMany({
      where: {
        book: { ownerId }
      }
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      booksShared,
      booksBorrowed: borrowRequests.filter((r) => r.status === 'BORROWED').length,
      averageRating: Math.round(averageRating * 100) / 100,
      responseTime: 0, // Calculate from actual approval times
      successfulLending: successfulBorrows,
      memberSince: user.createdAt,
      verifiedBadge: true, // Can be extended with verification logic
      successfulReturnPercentage: totalBorrows > 0 ? (successfulBorrows / totalBorrows) * 100 : 0,
      lateReturnPercentage: 0 // Calculate from overdue items
    };
  }

  // ==================== Settings ====================

  async updateSettings(userId: string, settings: any): Promise<any> {
    return this.repository.updateSettings(userId, settings);
  }

  async getSettings(userId: string): Promise<any> {
    return this.repository.getOrCreateSettings(userId);
  }

  // ==================== Helper Methods ====================

  private calculateDueDate(days: number = 14): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }
}
