import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// Types
export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalBorrows: number;
  totalReservations: number;
  activeLoans: number;
}

export interface ComprehensiveDashboard {
  stats: DashboardStats;
  mostBorrowed: Array<{ id: string; title: string; author: string; borrowCount: number }>;
  leastBorrowed: Array<{ id: string; title: string; author: string; borrowCount: number }>;
  lateReturns: Array<any>;
  borrowStatusDist: Array<{ status: string; count: number }>;
  borrowTrend: Array<{ date: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  recentActivity: Array<any>;
  booksByCategory: Array<{ category: string; count: number }>;
  categoryBorrowStats: Array<{ category: string; borrowCount: number }>;
  overdueStats: {
    overdueCount: number;
    totalActive: number;
    overduePercentage: string | number;
  };
}

// Query keys
export const analyticsKeys = {
  all: ['analytics'],
  dashboard: () => [...analyticsKeys.all, 'dashboard'],
  stats: () => [...analyticsKeys.all, 'stats'],
  mostBorrowed: () => [...analyticsKeys.all, 'mostBorrowed'],
  leastBorrowed: () => [...analyticsKeys.all, 'leastBorrowed'],
  lateReturns: () => [...analyticsKeys.all, 'lateReturns'],
  borrowStatusDist: () => [...analyticsKeys.all, 'borrowStatusDist'],
  borrowTrend: () => [...analyticsKeys.all, 'borrowTrend'],
  usersByRole: () => [...analyticsKeys.all, 'usersByRole'],
  recentActivity: () => [...analyticsKeys.all, 'recentActivity'],
  booksByCategory: () => [...analyticsKeys.all, 'booksByCategory'],
  categoryBorrowStats: () => [...analyticsKeys.all, 'categoryBorrowStats'],
  overdueStats: () => [...analyticsKeys.all, 'overdueStats']
};

// API Functions
async function getComprehensiveDashboard() {
  const { data } = await apiClient.get<{ data: ComprehensiveDashboard }>('/analytics/dashboard');
  return data.data;
}

async function getDashboardStats() {
  const { data } = await apiClient.get<{ data: DashboardStats }>('/analytics/stats');
  return data.data;
}

async function getMostBorrowedBooks(limit: number = 10) {
  const { data } = await apiClient.get('/analytics/books/most-borrowed', { params: { limit } });
  return data.data;
}

async function getLeastBorrowedBooks(limit: number = 10) {
  const { data } = await apiClient.get('/analytics/books/least-borrowed', { params: { limit } });
  return data.data;
}

async function getLateReturns() {
  const { data } = await apiClient.get('/analytics/borrows/late-returns');
  return data.data;
}

async function getBorrowStatusDistribution() {
  const { data } = await apiClient.get('/analytics/borrows/status-distribution');
  return data.data;
}

async function getBorrowTrendLastDays(days: number = 30) {
  const { data } = await apiClient.get('/analytics/borrows/trend', { params: { days } });
  return data.data;
}

async function getUsersByRole() {
  const { data } = await apiClient.get('/analytics/users/by-role');
  return data.data;
}

async function getRecentActivity(limit: number = 20) {
  const { data } = await apiClient.get('/analytics/activity/recent', { params: { limit } });
  return data.data;
}

async function getBooksByCategory() {
  const { data } = await apiClient.get('/analytics/books/by-category');
  return data.data;
}

async function getCategoryBorrowStats() {
  const { data } = await apiClient.get('/analytics/borrows/category-stats');
  return data.data;
}

async function getOverdueStats() {
  const { data } = await apiClient.get('/analytics/overdue/stats');
  return data.data;
}

// Query Hooks
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: getComprehensiveDashboard,
    staleTime: 5 * 60 * 1000
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: analyticsKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000
  });
};

export const useMostBorrowedBooks = (limit: number = 10) => {
  return useQuery({
    queryKey: [...analyticsKeys.mostBorrowed(), limit],
    queryFn: () => getMostBorrowedBooks(limit),
    staleTime: 10 * 60 * 1000
  });
};

export const useLeastBorrowedBooks = (limit: number = 10) => {
  return useQuery({
    queryKey: [...analyticsKeys.leastBorrowed(), limit],
    queryFn: () => getLeastBorrowedBooks(limit),
    staleTime: 10 * 60 * 1000
  });
};

export const useLateReturns = () => {
  return useQuery({
    queryKey: analyticsKeys.lateReturns(),
    queryFn: getLateReturns,
    staleTime: 5 * 60 * 1000
  });
};

export const useBorrowStatusDistribution = () => {
  return useQuery({
    queryKey: analyticsKeys.borrowStatusDist(),
    queryFn: getBorrowStatusDistribution,
    staleTime: 10 * 60 * 1000
  });
};

export const useBorrowTrendLastDays = (days: number = 30) => {
  return useQuery({
    queryKey: [...analyticsKeys.borrowTrend(), days],
    queryFn: () => getBorrowTrendLastDays(days),
    staleTime: 10 * 60 * 1000
  });
};

export const useUsersByRole = () => {
  return useQuery({
    queryKey: analyticsKeys.usersByRole(),
    queryFn: getUsersByRole,
    staleTime: 10 * 60 * 1000
  });
};

export const useRecentActivity = (limit: number = 20) => {
  return useQuery({
    queryKey: [...analyticsKeys.recentActivity(), limit],
    queryFn: () => getRecentActivity(limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useBooksByCategory = () => {
  return useQuery({
    queryKey: analyticsKeys.booksByCategory(),
    queryFn: getBooksByCategory,
    staleTime: 10 * 60 * 1000
  });
};

export const useCategoryBorrowStats = () => {
  return useQuery({
    queryKey: analyticsKeys.categoryBorrowStats(),
    queryFn: getCategoryBorrowStats,
    staleTime: 10 * 60 * 1000
  });
};

export const useOverdueStats = () => {
  return useQuery({
    queryKey: analyticsKeys.overdueStats(),
    queryFn: getOverdueStats,
    staleTime: 5 * 60 * 1000
  });
};
