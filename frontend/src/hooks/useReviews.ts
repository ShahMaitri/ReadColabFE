import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
});

// Types
export interface ReviewData {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; avatar?: string };
  book?: { id: string; title: string };
}

export interface BookRating {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

interface ReviewsResponse {
  data: ReviewData[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

// Query keys
export const reviewKeys = {
  all: ['reviews'],
  book: (bookId: string) => [...reviewKeys.all, 'book', bookId],
  bookDetail: (bookId: string, page: number, limit: number) => [...reviewKeys.book(bookId), { page, limit }],
  user: () => [...reviewKeys.all, 'user'],
  userDetail: (page: number, limit: number) => [...reviewKeys.user(), { page, limit }],
  rating: (bookId: string) => [...reviewKeys.all, 'rating', bookId]
};

// API Functions
async function createReview(bookId: string, rating: number, comment?: string) {
  const { data } = await apiClient.post('/reviews', { bookId, rating, comment });
  return data.data;
}

async function updateReview(reviewId: string, rating: number, comment?: string) {
  const { data } = await apiClient.patch(`/reviews/${reviewId}`, { rating, comment });
  return data.data;
}

async function deleteReview(reviewId: string) {
  await apiClient.delete(`/reviews/${reviewId}`);
}

async function getBookReviews(bookId: string, page: number = 1, limit: number = 10) {
  const { data } = await apiClient.get<ReviewsResponse>(`/reviews/book/${bookId}`, {
    params: { page, limit }
  });
  return data;
}

async function getUserReviews(page: number = 1, limit: number = 10) {
  const { data } = await apiClient.get<ReviewsResponse>('/reviews/user/me', {
    params: { page, limit }
  });
  return data;
}

async function getBookRating(bookId: string) {
  const { data } = await apiClient.get<{ data: BookRating }>(`/reviews/book/${bookId}/rating`);
  return data.data;
}

// Query Hooks
export const useBookReviews = (bookId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: reviewKeys.bookDetail(bookId, page, limit),
    queryFn: () => getBookReviews(bookId, page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useUserReviews = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: reviewKeys.userDetail(page, limit),
    queryFn: () => getUserReviews(page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useBookRating = (bookId: string) => {
  return useQuery({
    queryKey: reviewKeys.rating(bookId),
    queryFn: () => getBookRating(bookId),
    staleTime: 10 * 60 * 1000
  });
};

// Mutation Hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, rating, comment }: { bookId: string; rating: number; comment?: string }) =>
      createReview(bookId, rating, comment),
    onSuccess: (newReview) => {
      // Invalidate book reviews and rating
      queryClient.invalidateQueries({ queryKey: reviewKeys.book(newReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.rating(newReview.bookId) });
      // Invalidate user reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.user() });
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, rating, comment }: { reviewId: string; rating: number; comment?: string }) =>
      updateReview(reviewId, rating, comment),
    onSuccess: (updatedReview) => {
      // Invalidate reviews
      queryClient.invalidateQueries({ queryKey: reviewKeys.book(updatedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.rating(updatedReview.bookId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.user() });
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      // Broad invalidation since we don't know which book
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    }
  });
};
