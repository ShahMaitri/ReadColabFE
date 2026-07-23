import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// ============ TYPES ============
export interface BorrowData {
  id: string;
  userId: string;
  bookId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE';
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  createdAt: string;
  updatedAt: string;
  book?: {
    id: string;
    title: string;
    author: string;
    cover?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BorrowHistoryResponse {
  data: BorrowData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ReservationData {
  id: string;
  userId: string;
  bookId: string;
  status: 'PENDING' | 'READY' | 'CANCELLED';
  position: number;
  createdAt: string;
  updatedAt: string;
  book?: {
    id: string;
    title: string;
    author: string;
    cover?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ============ API FUNCTIONS ============
async function requestBorrow(bookId: string): Promise<BorrowData> {
  const response = await apiClient.post<{ success: boolean; data: BorrowData }>(
    '/borrow',
    { bookId }
  );
  return response.data.data;
}

async function getActiveBorrows(): Promise<BorrowData[]> {
  const response = await apiClient.get<{ success: boolean; data: BorrowData[] }>(
    '/borrow/active'
  );
  return response.data.data;
}

async function getBorrowHistory(
  page: number = 1,
  limit: number = 10
): Promise<BorrowHistoryResponse> {
  const response = await apiClient.get<{ success: boolean; data: BorrowHistoryResponse }>(
    `/borrow/history?page=${page}&limit=${limit}`
  );
  return response.data.data;
}

async function confirmBorrow(borrowId: string): Promise<BorrowData> {
  const response = await apiClient.patch<{ success: boolean; data: BorrowData }>(
    `/borrow/${borrowId}/confirm`
  );
  return response.data.data;
}

async function returnBook(borrowId: string): Promise<BorrowData> {
  const response = await apiClient.patch<{ success: boolean; data: BorrowData }>(
    `/borrow/${borrowId}/return`
  );
  return response.data.data;
}

async function reserveBook(bookId: string): Promise<ReservationData> {
  const response = await apiClient.post<{ success: boolean; data: ReservationData }>(
    '/reservation',
    { bookId }
  );
  return response.data.data;
}

async function getUserReservations(): Promise<ReservationData[]> {
  const response = await apiClient.get<{ success: boolean; data: ReservationData[] }>(
    '/reservation'
  );
  return response.data.data;
}

async function getReadyReservations(): Promise<ReservationData[]> {
  const response = await apiClient.get<{ success: boolean; data: ReservationData[] }>(
    '/reservation/ready'
  );
  return response.data.data;
}

async function getReservationQueue(bookId: string): Promise<ReservationData[]> {
  const response = await apiClient.get<{ success: boolean; data: ReservationData[] }>(
    `/reservation/queue/${bookId}`
  );
  return response.data.data;
}

async function cancelReservation(reservationId: string): Promise<ReservationData> {
  const response = await apiClient.delete<{ success: boolean; data: ReservationData }>(
    `/reservation/${reservationId}`
  );
  return response.data.data;
}

export const borrowReservationApi = {
  requestBorrow,
  getActiveBorrows,
  getBorrowHistory,
  confirmBorrow,
  returnBook,
  reserveBook,
  getUserReservations,
  getReadyReservations,
  getReservationQueue,
  cancelReservation,
};

// ============ QUERY KEYS ============
export const borrowKeys = {
  all: ['borrow'] as const,
  active: () => [...borrowKeys.all, 'active'] as const,
  history: () => [...borrowKeys.all, 'history'] as const,
  historyDetail: (page: number, limit: number) =>
    [...borrowKeys.history(), { page, limit }] as const,
};

export const reservationKeys = {
  all: ['reservation'] as const,
  user: () => [...reservationKeys.all, 'user'] as const,
  ready: () => [...reservationKeys.all, 'ready'] as const,
  queue: () => [...reservationKeys.all, 'queue'] as const,
  queueDetail: (bookId: string) =>
    [...reservationKeys.queue(), bookId] as const,
};

// ============ HOOKS ============
export const useRequestBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => borrowReservationApi.requestBorrow(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.active() });
      queryClient.invalidateQueries({ queryKey: borrowKeys.history() });
      queryClient.invalidateQueries({ queryKey: ['userBorrows'] });
    },
  });
};

export const useActiveBorrows = () => {
  return useQuery<BorrowData[]>({
    queryKey: borrowKeys.active(),
    queryFn: () => borrowReservationApi.getActiveBorrows(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBorrowHistory = (page: number = 1, limit: number = 10) => {
  return useQuery<BorrowHistoryResponse>({
    queryKey: borrowKeys.historyDetail(page, limit),
    queryFn: () => borrowReservationApi.getBorrowHistory(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useConfirmBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowId: string) => borrowReservationApi.confirmBorrow(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.active() });
      queryClient.invalidateQueries({ queryKey: borrowKeys.history() });
      queryClient.invalidateQueries({ queryKey: ['userBorrows'] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowId: string) => borrowReservationApi.returnBook(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.active() });
      queryClient.invalidateQueries({ queryKey: borrowKeys.history() });
      queryClient.invalidateQueries({ queryKey: ['userBorrows'] });
    },
  });
};

export const useReserveBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => borrowReservationApi.reserveBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.user() });
    },
  });
};

export const useUserReservations = () => {
  return useQuery<ReservationData[]>({
    queryKey: reservationKeys.user(),
    queryFn: () => borrowReservationApi.getUserReservations(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReadyReservations = () => {
  return useQuery<ReservationData[]>({
    queryKey: reservationKeys.ready(),
    queryFn: () => borrowReservationApi.getReadyReservations(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReservationQueue = (bookId: string) => {
  return useQuery<ReservationData[]>({
    queryKey: reservationKeys.queueDetail(bookId),
    queryFn: () => borrowReservationApi.getReservationQueue(bookId),
    enabled: !!bookId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => 
      borrowReservationApi.cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.user() });
    },
  });
};
