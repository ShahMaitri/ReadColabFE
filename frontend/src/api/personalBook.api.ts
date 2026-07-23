import { apiClient } from './axios';

// Types
export interface PersonalBookData {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  description?: string;
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'OLD' | 'DAMAGED';
  language: string;
  edition?: string;
  coverImage?: string;
  location?: string;
  availabilityStatus: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'UNAVAILABLE' | 'SOLD' | 'DONATED';
  visibility: 'VISIBLE_TO_EVERYONE' | 'VISIBLE_TO_DEPARTMENT' | 'HIDDEN';
  borrowCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalBookWithOwner extends PersonalBookData {
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

export interface BorrowRequestData {
  id: string;
  bookId: string;
  ownerId: string;
  requesterId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE';
  requestDate: string;
  approvedDate?: string;
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRequestWithDetails extends BorrowRequestData {
  book: PersonalBookData;
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

export interface ReviewData {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment?: string;
  reviewType: 'BOOK' | 'OWNER' | 'BORROW_EXPERIENCE';
  createdAt: string;
  updatedAt: string;
}

export interface OwnerProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  booksShared: number;
  booksBorrowed: number;
  averageRating: number;
  responseTime: number;
  successfulLending: number;
  memberSince: string;
  verifiedBadge: boolean;
  successfulReturnPercentage: number;
  lateReturnPercentage: number;
}

export interface PersonalBookSettingsData {
  id: string;
  userId: string;
  sharingEnabled: boolean;
  autoApproveRequests: boolean;
  maxActiveLendingLoans: number;
  defaultBorrowDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonalBookPayload {
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  description?: string;
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'OLD' | 'DAMAGED';
  language?: string;
  edition?: string;
  location?: string;
  visibility?: 'VISIBLE_TO_EVERYONE' | 'VISIBLE_TO_DEPARTMENT' | 'HIDDEN';
}

export interface UpdatePersonalBookPayload extends Partial<CreatePersonalBookPayload> {}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Client
export const personalBookApi = {
  // Personal Books
  getPersonalBooks: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    author?: string,
    category?: string,
    condition?: string,
    availability?: string,
    language?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResponse<PersonalBookData>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (author) params.append('author', author);
    if (category) params.append('category', category);
    if (condition) params.append('condition', condition);
    if (availability) params.append('availability', availability);
    if (language) params.append('language', language);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    const response = await apiClient.get<{ success: boolean; data: PersonalBookData[]; pagination?: PaginatedResponse<PersonalBookData>['pagination']; total?: number }>(
      `/personal-books?${params.toString()}`
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getPersonalBook: async (id: string): Promise<PersonalBookWithOwner> => {
    const response = await apiClient.get<{ success: boolean; data: PersonalBookWithOwner }>(
      `/personal-books/${id}`
    );
    return response.data.data;
  },

  createPersonalBook: async (data: CreatePersonalBookPayload): Promise<PersonalBookData> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: PersonalBookData }>(
      '/personal-books',
      data
    );
    return response.data.data;
  },

  updatePersonalBook: async (
    id: string,
    data: UpdatePersonalBookPayload
  ): Promise<PersonalBookData> => {
    const response = await apiClient.put<{ success: boolean; message: string; data: PersonalBookData }>(
      `/personal-books/${id}`,
      data
    );
    return response.data.data;
  },

  deletePersonalBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/personal-books/${id}`);
  },

  getMyPersonalBooks: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<PersonalBookData>> => {
    const response = await apiClient.get<{ success: boolean; data: PersonalBookData[]; pagination: PaginatedResponse<PersonalBookData>['pagination'] }>(
      `/personal-books/user/my-books?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Borrow Requests
  requestBook: async (bookId: string): Promise<BorrowRequestData> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: BorrowRequestData }>(
      `/personal-books/${bookId}/request`
    );
    return response.data.data;
  },

  approveBorrowRequest: async (requestId: string): Promise<BorrowRequestData> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: BorrowRequestData }>(
      `/personal-books/request/${requestId}/approve`
    );
    return response.data.data;
  },

  rejectBorrowRequest: async (requestId: string, remarks?: string): Promise<BorrowRequestData> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: BorrowRequestData }>(
      `/personal-books/request/${requestId}/reject`,
      { remarks }
    );
    return response.data.data;
  },

  markAsReturned: async (requestId: string, remarks?: string): Promise<BorrowRequestData> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: BorrowRequestData }>(
      `/personal-books/request/${requestId}/return`,
      { remarks }
    );
    return response.data.data;
  },

  getPendingRequests: async (): Promise<BorrowRequestWithDetails[]> => {
    const response = await apiClient.get<{ success: boolean; data: BorrowRequestWithDetails[] }>(
      '/personal-books/owner/pending'
    );
    return response.data.data;
  },

  getMyBorrowedBooks: async (): Promise<BorrowRequestWithDetails[]> => {
    const response = await apiClient.get<{ success: boolean; data: BorrowRequestWithDetails[] }>(
      '/personal-books/borrower/my-borrowed'
    );
    return response.data.data;
  },

  // Reviews
  createReview: async (
    bookId: string,
    rating: number,
    reviewType: 'BOOK' | 'OWNER' | 'BORROW_EXPERIENCE',
    comment?: string
  ): Promise<ReviewData> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: ReviewData }>(
      `/personal-books/${bookId}/reviews`,
      { rating, comment, reviewType }
    );
    return response.data.data;
  },

  getBookReviews: async (bookId: string): Promise<ReviewData[]> => {
    const response = await apiClient.get<{ success: boolean; data: ReviewData[] }>(
      `/personal-books/${bookId}/reviews`
    );
    return response.data.data;
  },

  // Owner Profile
  getOwnerProfile: async (ownerId: string): Promise<OwnerProfileData> => {
    const response = await apiClient.get<{ success: boolean; data: OwnerProfileData }>(
      `/personal-books/owner/${ownerId}/profile`
    );
    return response.data.data;
  },

  // Settings
  getSettings: async (): Promise<PersonalBookSettingsData> => {
    const response = await apiClient.get<{ success: boolean; data: PersonalBookSettingsData }>(
      '/personal-books/settings/me'
    );
    return response.data.data;
  },

  updateSettings: async (settings: Partial<PersonalBookSettingsData>): Promise<PersonalBookSettingsData> => {
    const response = await apiClient.put<{ success: boolean; message: string; data: PersonalBookSettingsData }>(
      '/personal-books/settings/me',
      settings
    );
    return response.data.data;
  },
};
