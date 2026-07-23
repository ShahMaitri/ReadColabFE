import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { bookKeys } from './useBooks';

export type ReviewSortOption = 'newest' | 'oldest' | 'highestRating' | 'lowestRating';

export interface ReviewData {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  book?: {
    id: string;
    title: string;
    author?: string;
    cover?: string;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface ReviewEligibility {
  canWriteReview: boolean;
  hasExistingReview: boolean;
  reason?: string;
}

export interface ReviewListResponse {
  data: ReviewData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  sortBy?: ReviewSortOption;
  rating?: number;
  search?: string;
}

export interface AdminReviewFilters extends ReviewFilters {
  bookId?: string;
  userId?: string;
  reportedOnly?: boolean;
}

export const reviewKeys = {
  all: ['reviews'] as const,
  book: (bookId: string) => [...reviewKeys.all, 'book', bookId] as const,
  bookList: (bookId: string, filters: ReviewFilters) => [...reviewKeys.book(bookId), filters] as const,
  me: () => [...reviewKeys.all, 'me'] as const,
  meList: (filters: ReviewFilters) => [...reviewKeys.me(), filters] as const,
  rating: (bookId: string) => [...reviewKeys.all, 'rating', bookId] as const,
  eligibility: (bookId: string) => [...reviewKeys.all, 'eligibility', bookId] as const,
  admin: () => [...reviewKeys.all, 'admin'] as const,
  adminList: (filters: AdminReviewFilters) => [...reviewKeys.admin(), filters] as const
};

async function createReview(bookId: string, rating: number, comment?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: ReviewData }>('/reviews', {
    bookId,
    rating,
    comment
  });
  return data.data;
}

async function updateReview(reviewId: string, rating: number, comment?: string) {
  const { data } = await apiClient.patch<{ success: boolean; message: string; data: ReviewData }>(
    `/reviews/${reviewId}`,
    { rating, comment }
  );
  return data.data;
}

async function deleteReview(reviewId: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string; data: ReviewData }>(
    `/reviews/${reviewId}`
  );
  return data.data;
}

async function deleteAdminReview(reviewId: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string; data: ReviewData }>(
    `/admin/reviews/${reviewId}`
  );
  return data.data;
}

async function getBookReviews(bookId: string, filters: ReviewFilters = {}): Promise<ReviewListResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: ReviewData[]; pagination: ReviewListResponse['pagination'] }>(
    `/books/${bookId}/reviews`,
    { params: filters }
  );
  return {
    data: data.data,
    pagination: data.pagination
  };
}

async function getMyReviews(filters: ReviewFilters = {}): Promise<ReviewListResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: ReviewData[]; pagination: ReviewListResponse['pagination'] }>(
    '/reviews/me',
    { params: filters }
  );
  return {
    data: data.data,
    pagination: data.pagination
  };
}

async function getBookRating(bookId: string): Promise<ReviewSummary> {
  const { data } = await apiClient.get<{ success: boolean; data: ReviewSummary }>(`/books/${bookId}/rating`);
  return data.data;
}

async function getReviewEligibility(bookId: string): Promise<ReviewEligibility> {
  const { data } = await apiClient.get<{ success: boolean; data: ReviewEligibility }>(
    `/books/${bookId}/review-eligibility`
  );
  return data.data;
}

async function getAdminReviews(filters: AdminReviewFilters = {}): Promise<ReviewListResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: ReviewData[]; pagination: ReviewListResponse['pagination'] }>(
    '/admin/reviews',
    { params: filters }
  );
  return {
    data: data.data,
    pagination: data.pagination
  };
}

export const useBookReviews = (
  bookId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: ReviewSortOption = 'newest',
  rating?: number,
  search?: string
) => {
  return useQuery<ReviewListResponse>({
    queryKey: reviewKeys.bookList(bookId, { page, limit, sortBy, rating, search }),
    queryFn: () => getBookReviews(bookId, { page, limit, sortBy, rating, search }),
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000
  });
};

export const useMyReviews = (
  page: number = 1,
  limit: number = 10,
  sortBy: ReviewSortOption = 'newest',
  rating?: number,
  search?: string
) => {
  return useQuery<ReviewListResponse>({
    queryKey: reviewKeys.meList({ page, limit, sortBy, rating, search }),
    queryFn: () => getMyReviews({ page, limit, sortBy, rating, search }),
    staleTime: 5 * 60 * 1000
  });
};

export const useBookRating = (bookId: string) => {
  return useQuery<ReviewSummary>({
    queryKey: reviewKeys.rating(bookId),
    queryFn: () => getBookRating(bookId),
    enabled: !!bookId,
    staleTime: 10 * 60 * 1000
  });
};

export const useReviewEligibility = (bookId: string) => {
  return useQuery<ReviewEligibility>({
    queryKey: reviewKeys.eligibility(bookId),
    queryFn: () => getReviewEligibility(bookId),
    enabled: !!bookId,
    staleTime: 2 * 60 * 1000
  });
};

export const useAdminReviews = (
  page: number = 1,
  limit: number = 20,
  sortBy: ReviewSortOption = 'newest',
  filters?: Omit<AdminReviewFilters, 'page' | 'limit' | 'sortBy'>
) => {
  const queryFilters: AdminReviewFilters = {
    page,
    limit,
    sortBy,
    ...(filters || {})
  };

  return useQuery<ReviewListResponse>({
    queryKey: reviewKeys.adminList(queryFilters),
    queryFn: () => getAdminReviews(queryFilters),
    staleTime: 5 * 60 * 1000
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, rating, comment }: { bookId: string; rating: number; comment?: string }) =>
      createReview(bookId, rating, comment),
    onSuccess: (newReview) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.book(newReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.rating(newReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.me() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, rating, comment }: { reviewId: string; rating: number; comment?: string }) =>
      updateReview(reviewId, rating, comment),
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.book(updatedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.rating(updatedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.me() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: (deletedReview) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.book(deletedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.rating(deletedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.me() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    }
  });
};

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteAdminReview(reviewId),
    onSuccess: (deletedReview) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.book(deletedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.rating(deletedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.me() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    }
  });
};
