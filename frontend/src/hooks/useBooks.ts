import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// Types
export interface BookData {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publicationDate?: string;
  category?: string;
  quantity: number;
  availableQuantity: number;
  cover?: string;
  qrCode?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  totalReviews?: number;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publicationDate?: string;
  category?: string;
  quantity?: number;
}

export interface UpdateBookPayload extends Partial<CreateBookPayload> {}

export interface BooksResponse {
  data: BookData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// API Client
export const bookApi = {
  getBooks: async (page: number = 1, limit: number = 10, search?: string, category?: string, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Promise<BooksResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    const response = await apiClient.get<{ success: boolean; data: BooksResponse }>(`/books?${params.toString()}`);
    return response.data.data;
  },

  searchBooks: async (query: string, limit: number = 10): Promise<BookData[]> => {
    const response = await apiClient.get<{ success: boolean; data: BookData[] }>(`/books/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.data;
  },

  getBook: async (id: string): Promise<BookData> => {
    const response = await apiClient.get<{ success: boolean; data: BookData }>(`/books/${id}`);
    return response.data.data;
  },

  createBook: async (data: CreateBookPayload): Promise<BookData> => {
    const response = await apiClient.post<{ success: boolean; data: BookData }>('/books', data);
    return response.data.data;
  },

  updateBook: async (id: string, data: UpdateBookPayload): Promise<BookData> => {
    const response = await apiClient.patch<{ success: boolean; data: BookData }>(`/books/${id}`, data);
    return response.data.data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },

  uploadCover: async (id: string, file: File): Promise<BookData> => {
    const formData = new FormData();
    formData.append('cover', file);
    const response = await apiClient.post<{ success: boolean; data: BookData }>(`/books/${id}/cover`, formData);
    return response.data.data;
  },

  removeCover: async (id: string): Promise<BookData> => {
    const response = await apiClient.delete<{ success: boolean; data: BookData }>(`/books/${id}/cover`);
    return response.data.data;
  },

  generateQRCode: async (id: string): Promise<{ qrCode: string }> => {
    const response = await apiClient.post<{ success: boolean; data: { qrCode: string } }>(`/books/${id}/qr-code`);
    return response.data.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<{ success: boolean; data: string[] }>('/books/categories');
    return response.data.data;
  }
};

// Query keys factory
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters: any) => [...bookKeys.lists(), { ...filters }] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  search: () => [...bookKeys.all, 'search'] as const,
  categories: () => [...bookKeys.all, 'categories'] as const
};

// Queries
export const useBooks = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return useQuery<BooksResponse>({
    queryKey: bookKeys.list({ page, limit, search, category, sortBy, sortOrder }),
    queryFn: () => bookApi.getBooks(page, limit, search, category, sortBy, sortOrder),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useBook = (id: string) => {
  return useQuery<BookData>({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookApi.getBook(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};

export const useSearchBooks = (query: string, limit: number = 10) => {
  return useQuery<BookData[]>({
    queryKey: [...bookKeys.search(), query],
    queryFn: () => bookApi.searchBooks(query, limit),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000
  });
};

export const useCategories = () => {
  return useQuery<string[]>({
    queryKey: bookKeys.categories(),
    queryFn: () => bookApi.getCategories(),
    staleTime: 30 * 60 * 1000 // 30 minutes
  });
};

// Mutations
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookPayload) => bookApi.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    }
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookPayload }) =>
      bookApi.updateBook(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.setQueryData(bookKeys.detail(data.id), data);
    }
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    }
  });
};

export const useUploadCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => bookApi.uploadCover(id, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.setQueryData(bookKeys.detail(data.id), data);
    }
  });
};

export const useRemoveCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookApi.removeCover(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.setQueryData(bookKeys.detail(data.id), data);
    }
  });
};

export const useGenerateQRCode = () => {
  return useMutation({
    mutationFn: (id: string) => bookApi.generateQRCode(id),
    retry: 1
  });
};
