import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// Query keys
export const adminKeys = {
  all: ['admin'],
  books: () => [...adminKeys.all, 'books'],
  booksDetail: (page: number, limit: number) => [...adminKeys.books(), { page, limit }],
  users: () => [...adminKeys.all, 'users'],
  usersDetail: (page: number, limit: number, role?: string) => [...adminKeys.users(), { page, limit, role }],
  borrows: () => [...adminKeys.all, 'borrows'],
  borrowsDetail: (page: number, limit: number, status?: string) => [...adminKeys.borrows(), { page, limit, status }],
  reservations: () => [...adminKeys.all, 'reservations'],
  reservationsDetail: (page: number, limit: number, status?: string) => [...adminKeys.reservations(), { page, limit, status }]
};

// Admin API Functions
async function getBooks(page: number = 1, limit: number = 20) {
  const { data } = await apiClient.get('/admin/books', { params: { page, limit } });
  return data;
}

async function updateBook(bookId: string, updates: any) {
  const { data } = await apiClient.patch(`/admin/books/${bookId}`, updates);
  return data.data;
}

async function deleteBook(bookId: string) {
  await apiClient.delete(`/admin/books/${bookId}`);
}

async function getUsers(page: number = 1, limit: number = 20, role?: string) {
  const { data } = await apiClient.get('/admin/users', { params: { page, limit, role } });
  return data;
}

async function updateUser(userId: string, updates: any) {
  const { data } = await apiClient.patch(`/admin/users/${userId}`, updates);
  return data.data;
}

async function deleteUser(userId: string) {
  await apiClient.delete(`/admin/users/${userId}`);
}

async function getBorrows(page: number = 1, limit: number = 20, status?: string) {
  const { data } = await apiClient.get('/admin/borrows', { params: { page, limit, status } });
  return data;
}

async function approveBorrow(borrowId: string) {
  const { data } = await apiClient.post(`/admin/borrows/${borrowId}/approve`);
  return data.data;
}

async function rejectBorrow(borrowId: string) {
  const { data } = await apiClient.post(`/admin/borrows/${borrowId}/reject`);
  return data.data;
}

async function returnBorrow(borrowId: string) {
  const { data } = await apiClient.post(`/admin/borrows/${borrowId}/return`);
  return data.data;
}

async function getReservations(page: number = 1, limit: number = 20, status?: string) {
  const { data } = await apiClient.get('/admin/reservations', { params: { page, limit, status } });
  return data;
}

async function cancelReservation(reservationId: string) {
  const { data } = await apiClient.post(`/admin/reservations/${reservationId}/cancel`);
  return data.data;
}

async function markReservationReady(reservationId: string) {
  const { data } = await apiClient.post(`/admin/reservations/${reservationId}/ready`);
  return data.data;
}

// Query Hooks - Books
export const useAdminBooks = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: adminKeys.booksDetail(page, limit),
    queryFn: () => getBooks(page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, updates }: { bookId: string; updates: any }) => updateBook(bookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.books() });
    }
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.books() });
    }
  });
};

// Query Hooks - Users
export const useAdminUsers = (page: number = 1, limit: number = 20, role?: string) => {
  return useQuery({
    queryKey: adminKeys.usersDetail(page, limit, role),
    queryFn: () => getUsers(page, limit, role),
    staleTime: 5 * 60 * 1000
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) => updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    }
  });
};

// Query Hooks - Borrows
export const useAdminBorrows = (page: number = 1, limit: number = 20, status?: string) => {
  return useQuery({
    queryKey: adminKeys.borrowsDetail(page, limit, status),
    queryFn: () => getBorrows(page, limit, status),
    staleTime: 5 * 60 * 1000
  });
};

export const useApproveBorrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (borrowId: string) => approveBorrow(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.borrows() });
    }
  });
};

export const useRejectBorrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (borrowId: string) => rejectBorrow(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.borrows() });
    }
  });
};

export const useReturnBorrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (borrowId: string) => returnBorrow(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.borrows() });
    }
  });
};

// Query Hooks - Reservations
export const useAdminReservations = (page: number = 1, limit: number = 20, status?: string) => {
  return useQuery({
    queryKey: adminKeys.reservationsDetail(page, limit, status),
    queryFn: () => getReservations(page, limit, status),
    staleTime: 5 * 60 * 1000
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reservations() });
    }
  });
};

export const useMarkReservationReady = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => markReservationReady(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reservations() });
    }
  });
};
