import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  personalBookApi,
  type PersonalBookData,
  type PersonalBookWithOwner,
  type BorrowRequestData,
  type BorrowRequestWithDetails,
  type ReviewData,
  type OwnerProfileData,
  type PersonalBookSettingsData,
  type CreatePersonalBookPayload,
  type UpdatePersonalBookPayload,
} from '../api/personalBook.api';

// Query Keys
const personalBookKeys = {
  all: ['personalBooks'] as const,
  lists: () => [...personalBookKeys.all, 'list'] as const,
  list: (filters: any) => [...personalBookKeys.lists(), filters] as const,
  details: () => [...personalBookKeys.all, 'detail'] as const,
  detail: (id: string) => [...personalBookKeys.details(), id] as const,
  myBooks: () => [...personalBookKeys.all, 'myBooks'] as const,
  requests: () => [...personalBookKeys.all, 'requests'] as const,
  borrowed: () => [...personalBookKeys.all, 'borrowed'] as const,
  reviews: (bookId: string) => [...personalBookKeys.all, 'reviews', bookId] as const,
  ownerProfile: (ownerId: string) => [...personalBookKeys.all, 'ownerProfile', ownerId] as const,
  settings: () => [...personalBookKeys.all, 'settings'] as const,
};

// Hooks

export const useSearchPersonalBooks = (
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
) => {
  return useQuery({
    queryKey: personalBookKeys.list({ page, limit, search, author, category, condition, availability, language, sortBy, sortOrder }),
    queryFn: () =>
      personalBookApi.getPersonalBooks(page, limit, search, author, category, condition, availability, language, sortBy, sortOrder),
    enabled: true,
  });
};

export const useGetPersonalBook = (id: string) => {
  return useQuery({
    queryKey: personalBookKeys.detail(id),
    queryFn: () => personalBookApi.getPersonalBook(id),
    enabled: !!id,
  });
};

export const useCreatePersonalBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonalBookPayload) => personalBookApi.createPersonalBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.myBooks() });
    },
  });
};

export const useUpdatePersonalBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonalBookPayload }) =>
      personalBookApi.updatePersonalBook(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: personalBookKeys.myBooks() });
    },
  });
};

export const useDeletePersonalBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personalBookApi.deletePersonalBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.myBooks() });
      queryClient.invalidateQueries({ queryKey: personalBookKeys.lists() });
    },
  });
};

export const useMyPersonalBooks = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: personalBookKeys.myBooks(),
    queryFn: () => personalBookApi.getMyPersonalBooks(page, limit),
    enabled: true,
  });
};

// Borrow Requests
export const useRequestBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => personalBookApi.requestBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.borrowed() });
    },
  });
};

export const useApproveBorrowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => personalBookApi.approveBorrowRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.requests() });
    },
  });
};

export const useRejectBorrowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, remarks }: { requestId: string; remarks?: string }) =>
      personalBookApi.rejectBorrowRequest(requestId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.requests() });
    },
  });
};

export const useMarkAsReturned = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, remarks }: { requestId: string; remarks?: string }) =>
      personalBookApi.markAsReturned(requestId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.borrowed() });
    },
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: personalBookKeys.requests(),
    queryFn: () => personalBookApi.getPendingRequests(),
    enabled: true,
  });
};

export const useMyBorrowedBooks = () => {
  return useQuery({
    queryKey: personalBookKeys.borrowed(),
    queryFn: () => personalBookApi.getMyBorrowedBooks(),
    enabled: true,
  });
};

// Reviews
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookId,
      rating,
      reviewType,
      comment,
    }: {
      bookId: string;
      rating: number;
      reviewType: 'BOOK' | 'OWNER' | 'BORROW_EXPERIENCE';
      comment?: string;
    }) => personalBookApi.createReview(bookId, rating, reviewType, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.reviews(data.bookId) });
      queryClient.invalidateQueries({ queryKey: personalBookKeys.detail(data.bookId) });
    },
  });
};

export const useGetBookReviews = (bookId: string) => {
  return useQuery({
    queryKey: personalBookKeys.reviews(bookId),
    queryFn: () => personalBookApi.getBookReviews(bookId),
    enabled: !!bookId,
  });
};

// Owner Profile
export const useGetOwnerProfile = (ownerId: string) => {
  return useQuery({
    queryKey: personalBookKeys.ownerProfile(ownerId),
    queryFn: () => personalBookApi.getOwnerProfile(ownerId),
    enabled: !!ownerId,
  });
};

// Settings
export const useGetSettings = () => {
  return useQuery({
    queryKey: personalBookKeys.settings(),
    queryFn: () => personalBookApi.getSettings(),
    enabled: true,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<PersonalBookSettingsData>) => personalBookApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalBookKeys.settings() });
    },
  });
};
