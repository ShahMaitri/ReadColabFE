import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// Types
export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover?: string;
    category?: string;
    availableQuantity: number;
    status: string;
  };
}

interface WishlistResponse {
  data: WishlistItem[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

// Query keys
export const wishlistKeys = {
  all: ['wishlist'],
  list: () => [...wishlistKeys.all, 'list'],
  listDetail: (page: number, limit: number) => [...wishlistKeys.list(), { page, limit }],
  status: (bookId: string) => [...wishlistKeys.all, 'status', bookId],
  count: () => [...wishlistKeys.all, 'count']
};

// API Functions
async function addToWishlist(bookId: string) {
  const { data } = await apiClient.post('/wishlist', { bookId });
  return data.data;
}

async function removeFromWishlist(bookId: string) {
  await apiClient.delete(`/wishlist/${bookId}`);
}

async function getWishlist(page: number = 1, limit: number = 20) {
  const { data } = await apiClient.get<WishlistResponse>('/wishlist', {
    params: { page, limit }
  });
  return data;
}

async function isInWishlist(bookId: string) {
  const { data } = await apiClient.get<{ data: { inWishlist: boolean } }>(`/wishlist/book/${bookId}/status`);
  return data.data.inWishlist;
}

async function getWishlistCount() {
  const { data } = await apiClient.get<{ data: { count: number } }>('/wishlist/count/total');
  return data.data.count;
}

// Query Hooks
export const useWishlist = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: wishlistKeys.listDetail(page, limit),
    queryFn: () => getWishlist(page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useIsInWishlist = (bookId: string) => {
  return useQuery({
    queryKey: wishlistKeys.status(bookId),
    queryFn: () => isInWishlist(bookId),
    staleTime: 5 * 60 * 1000
  });
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: () => getWishlistCount(),
    staleTime: 5 * 60 * 1000
  });
};

// Mutation Hooks
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => addToWishlist(bookId),
    onMutate: (bookId: string) => {
      // Optimistic update for status
      queryClient.setQueryData(wishlistKeys.status(bookId), true);
    },
    onSuccess: (newItem) => {
      // Invalidate wishlist list and count
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
      queryClient.invalidateQueries({ queryKey: ['userWishlist'] });
      queryClient.setQueryData(wishlistKeys.status(newItem.bookId), true);
    },
    onError: (error, bookId) => {
      // Revert optimistic update on error
      queryClient.setQueryData(wishlistKeys.status(bookId), false);
    }
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => removeFromWishlist(bookId),
    onMutate: (bookId: string) => {
      // Optimistic update
      queryClient.setQueryData(wishlistKeys.status(bookId), false);
    },
    onSuccess: (_, bookId) => {
      // Invalidate wishlist
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
      queryClient.invalidateQueries({ queryKey: ['userWishlist'] });
      queryClient.setQueryData(wishlistKeys.status(bookId), false);
    },
    onError: (error, bookId) => {
      // Revert optimistic update
      queryClient.setQueryData(wishlistKeys.status(bookId), true);
    }
  });
};
