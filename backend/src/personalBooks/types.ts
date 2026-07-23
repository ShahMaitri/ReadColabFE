/**
 * Personal Book Sharing Types and Interfaces
 */

// Book Condition Options
export type BookCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'OLD' | 'DAMAGED';

// Availability Status Options
export type AvailabilityStatus = 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'UNAVAILABLE' | 'SOLD' | 'DONATED';

// Visibility Options
export type Visibility = 'VISIBLE_TO_EVERYONE' | 'VISIBLE_TO_DEPARTMENT' | 'HIDDEN';

// Borrow Request Status
export type BorrowRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE';

// Review Types
export type ReviewType = 'BOOK' | 'OWNER' | 'BORROW_EXPERIENCE';

// Personal Book Entity
export interface IPersonalBook {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  publisher?: string | null;
  isbn?: string | null;
  category?: string | null;
  description?: string | null;
  condition: BookCondition;
  language: string;
  edition?: string | null;
  coverImage?: string | null;
  location?: string | null;
  availabilityStatus: AvailabilityStatus;
  visibility: Visibility;
  borrowCount: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Personal Borrow Request Entity
export interface IPersonalBorrowRequest {
  id: string;
  bookId: string;
  ownerId: string;
  requesterId: string;
  status: BorrowRequestStatus | string;
  requestDate: Date;
  approvedDate?: Date | null;
  borrowDate?: Date | null;
  dueDate?: Date | null;
  returnDate?: Date | null;
  remarks?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Personal Book Review Entity
export interface IPersonalBookReview {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  reviewType: ReviewType | string;
  createdAt: Date;
  updatedAt: Date;
}

// Personal Book Sharing Settings Entity
export interface IPersonalBookSharingSettings {
  id: string;
  userId: string;
  sharingEnabled: boolean;
  autoApproveRequests: boolean;
  maxActiveLendingLoans: number;
  defaultBorrowDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating personal books
export interface CreatePersonalBookDTO {
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  description?: string;
  condition: BookCondition;
  language?: string;
  edition?: string;
  location?: string;
  visibility?: Visibility;
}

// DTO for updating personal books
export interface UpdatePersonalBookDTO {
  title?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  description?: string;
  condition?: BookCondition;
  language?: string;
  edition?: string;
  location?: string;
  availabilityStatus?: AvailabilityStatus;
  visibility?: Visibility;
}

// DTO for borrow request
export interface CreateBorrowRequestDTO {
  bookId: string;
}

// DTO for approving/rejecting borrow request
export interface UpdateBorrowRequestDTO {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
  dueDate?: Date;
}

// DTO for marking as returned
export interface MarkAsReturnedDTO {
  remarks?: string;
}

// DTO for personal book review
export interface CreatePersonalBookReviewDTO {
  rating: number;
  comment?: string;
  reviewType: ReviewType;
}

// Extended Personal Book with owner info
export interface PersonalBookWithOwner extends IPersonalBook {
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    borrowRequests: number;
    reviews: number;
  };
}

// Borrow Request with details
export interface BorrowRequestWithDetails extends IPersonalBorrowRequest {
  book: IPersonalBook;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  requester: {
    id: string;
    name: string;
    email: string;
  };
}

// Search and Filter Options
export interface PersonalBookSearchOptions {
  search?: string;
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  condition?: BookCondition;
  availability?: AvailabilityStatus;
  visibility?: Visibility;
  ownerId?: string;
  department?: string;
  language?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'borrowCount' | 'averageRating';
  sortOrder?: 'asc' | 'desc';
}

// Owner Profile Statistics
export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  booksShared: number;
  booksBorrowed: number;
  averageRating: number;
  responseTime: number;
  successfulLending: number;
  memberSince: Date;
  verifiedBadge: boolean;
  successfulReturnPercentage: number;
  lateReturnPercentage: number;
}
