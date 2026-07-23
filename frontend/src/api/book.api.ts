import { apiClient } from './axios';

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

export interface UpdateBookPayload extends Partial<CreateBookPayload> {
}

export interface BooksResponse {
  data: BookData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function getBooks(
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<BooksResponse> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  params.append('sortBy', sortBy);
  params.append('sortOrder', sortOrder);

  const response = await apiClient.get<{ success: boolean; data: BooksResponse }>(
    `/books?${params.toString()}`
  );
  return response.data.data;
}

async function searchBooks(query: string, limit: number = 10): Promise<BookData[]> {
  const response = await apiClient.get<{ success: boolean; data: BookData[] }>(
    `/books/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data.data;
}

async function getBook(id: string): Promise<BookData> {
  const response = await apiClient.get<{ success: boolean; data: BookData }>(`/books/${id}`);
  return response.data.data;
}

async function createBook(data: CreateBookPayload): Promise<BookData> {
  const response = await apiClient.post<{ success: boolean; data: BookData }>('/books', data);
  return response.data.data;
}

async function updateBook(id: string, data: UpdateBookPayload): Promise<BookData> {
  const response = await apiClient.patch<{ success: boolean; data: BookData }>(
    `/books/${id}`,
    data
  );
  return response.data.data;
}

async function deleteBook(id: string): Promise<void> {
  await apiClient.delete(`/books/${id}`);
}

async function uploadCover(id: string, file: File): Promise<BookData> {
  const formData = new FormData();
  formData.append('cover', file);

  const response = await apiClient.post<{ success: boolean; data: BookData }>(
    `/books/${id}/cover`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data.data;
}

async function generateQRCode(id: string): Promise<{ qrCode: string }> {
  const response = await apiClient.post<{ success: boolean; data: { qrCode: string } }>(
    `/books/${id}/qr-code`
  );
  return response.data.data;
}

async function getCategories(): Promise<string[]> {
  const response = await apiClient.get<{ success: boolean; data: string[] }>('/books/categories');
  return response.data.data;
}

export const bookApi = {
  getBooks,
  searchBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadCover,
  generateQRCode,
  getCategories
};
