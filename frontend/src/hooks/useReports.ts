import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  department?: string;
}

export interface MonthlyReportRow {
  month: string;
  totalBorrows: number;
  returned: number;
  overdue: number;
  active: number;
  departmentCount: number;
}

export interface DepartmentReportRow {
  department: string;
  totalBorrows: number;
  returned: number;
  overdue: number;
}

export interface BorrowReportRow {
  id: string;
  borrowedAt: string;
  borrowDate?: string | null;
  dueDate?: string | null;
  returnDate?: string | null;
  status: string;
  userName?: string;
  userEmail?: string;
  department: string;
  bookTitle?: string;
  bookAuthor?: string;
  category?: string;
}

export interface PopularBookRow {
  id: string;
  title: string;
  author: string;
  category?: string;
  borrowCount: number;
}

export interface ReadingTrendRow {
  date: string;
  requested: number;
  returned: number;
  overdue: number;
}

export interface ReportingDashboardData {
  monthly: MonthlyReportRow[];
  departments: DepartmentReportRow[];
  borrows: BorrowReportRow[];
  popularBooks: PopularBookRow[];
  readingTrends: ReadingTrendRow[];
}

const reportsKeys = {
  all: ['reports'],
  dashboard: (filters: ReportFilters) => [...reportsKeys.all, 'dashboard', filters]
};

const toParams = (filters: ReportFilters) => {
  const params: Record<string, string> = {};

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }
  if (filters.department) {
    params.department = filters.department;
  }

  return params;
};

const getReportingDashboard = async (filters: ReportFilters) => {
  const { data } = await apiClient.get<{ data: ReportingDashboardData }>('/analytics/reports/dashboard', {
    params: toParams(filters)
  });

  return data.data;
};

export const useReportingDashboard = (filters: ReportFilters) => {
  return useQuery({
    queryKey: reportsKeys.dashboard(filters),
    queryFn: () => getReportingDashboard(filters),
    staleTime: 60_000
  });
};

export const downloadReport = async (
  reportType: 'monthly' | 'department' | 'borrow' | 'popular-books' | 'reading-trends',
  format: 'csv' | 'excel',
  filters: ReportFilters
): Promise<void> => {
  const response = await apiClient.get('/analytics/reports/export', {
    params: {
      type: reportType,
      format,
      ...toParams(filters)
    },
    responseType: 'blob'
  });

  const contentTypeHeader = response.headers['content-type'];
  const contentType = typeof contentTypeHeader === 'string'
    ? contentTypeHeader
    : 'application/octet-stream';
  const blob = new Blob([response.data], { type: contentType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  const extension = format === 'excel' ? 'xls' : 'csv';
  const dateTag = new Date().toISOString().slice(0, 10);
  link.download = `${reportType}-report-${dateTag}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
