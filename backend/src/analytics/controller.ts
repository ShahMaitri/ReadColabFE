import { Request, Response } from 'express';
import { analyticsService } from './service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

const parseReportFilters = (req: Request) => {
  const startDateValue = req.query.startDate as string | undefined;
  const endDateValue = req.query.endDate as string | undefined;
  const department = (req.query.department as string | undefined)?.trim();

  const startDate = startDateValue ? new Date(startDateValue) : undefined;
  const endDate = endDateValue ? new Date(endDateValue) : undefined;

  if (startDate && Number.isNaN(startDate.getTime())) {
    throw new AppError('Invalid startDate format', 400);
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    throw new AppError('Invalid endDate format', 400);
  }

  return {
    startDate,
    endDate,
    department: department || undefined
  };
};

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats();
  res.json({
    success: true,
    message: 'Dashboard stats retrieved',
    data: stats
  });
});

export const getMostBorrowedBooks = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const books = await analyticsService.getMostBorrowedBooks(limit);

  res.json({
    success: true,
    message: 'Most borrowed books retrieved',
    data: books
  });
});

export const getLeastBorrowedBooks = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const books = await analyticsService.getLeastBorrowedBooks(limit);

  res.json({
    success: true,
    message: 'Least borrowed books retrieved',
    data: books
  });
});

export const getLateReturns = asyncHandler(async (req: Request, res: Response) => {
  const lateReturns = await analyticsService.getLateReturns();

  res.json({
    success: true,
    message: 'Late returns retrieved',
    data: lateReturns
  });
});

export const getBorrowStatusDistribution = asyncHandler(async (req: Request, res: Response) => {
  const distribution = await analyticsService.getBorrowStatusDistribution();

  res.json({
    success: true,
    message: 'Borrow status distribution retrieved',
    data: distribution
  });
});

export const getBorrowTrendLastDays = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const trend = await analyticsService.getBorrowTrendLastDays(days);

  res.json({
    success: true,
    message: 'Borrow trend retrieved',
    data: trend
  });
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const distribution = await analyticsService.getUsersByRole();

  res.json({
    success: true,
    message: 'Users by role retrieved',
    data: distribution
  });
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const activity = await analyticsService.getRecentActivity(limit);

  res.json({
    success: true,
    message: 'Recent activity retrieved',
    data: activity
  });
});

export const getBooksByCategory = asyncHandler(async (req: Request, res: Response) => {
  const books = await analyticsService.getBooksByCategory();

  res.json({
    success: true,
    message: 'Books by category retrieved',
    data: books
  });
});

export const getCategoryBorrowStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getCategoryBorrowStats();

  res.json({
    success: true,
    message: 'Category borrow stats retrieved',
    data: stats
  });
});

export const getOverdueStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getOverdueStats();

  res.json({
    success: true,
    message: 'Overdue stats retrieved',
    data: stats
  });
});

export const getGlobalWishlistCount = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await analyticsService.getGlobalWishlistCount();

  res.json({
    success: true,
    message: 'Global wishlist count retrieved',
    data: stats
  });
});

export const getGlobalDueSoonBorrows = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const borrows = await analyticsService.getGlobalDueSoonBorrows(days);

  res.json({
    success: true,
    message: 'Global due soon borrows retrieved',
    data: borrows
  });
});

export const getGlobalReadingStatistics = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await analyticsService.getGlobalReadingStatistics();

  res.json({
    success: true,
    message: 'Global reading statistics retrieved',
    data: stats
  });
});

export const getComprehensiveDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await analyticsService.getComprehensiveDashboard();

  res.json({
    success: true,
    message: 'Comprehensive dashboard data retrieved',
    data: dashboard
  });
});

// Get user statistics for employee dashboard
export const getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const stats = await analyticsService.getUserStatistics(userId);

  res.json({
    success: true,
    message: 'User statistics retrieved',
    data: stats
  });
});

// Get trending books (most borrowed recently)
export const getTrendingBooks = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const books = await analyticsService.getMostBorrowedBooks(limit);

  res.json({
    success: true,
    message: 'Trending books retrieved',
    data: books
  });
});

export const getReportingDashboard = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req);
  const dashboard = await analyticsService.getReportingDashboard(filters);

  res.json({
    success: true,
    message: 'Reporting dashboard retrieved',
    data: dashboard
  });
});

export const getMonthlyReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req);
  const data = await analyticsService.getMonthlyReports(filters);

  res.json({
    success: true,
    message: 'Monthly reports retrieved',
    data
  });
});

export const getDepartmentReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req);
  const data = await analyticsService.getDepartmentReports(filters);

  res.json({
    success: true,
    message: 'Department reports retrieved',
    data
  });
});

export const getBorrowReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req);
  const data = await analyticsService.getBorrowReports(filters);

  res.json({
    success: true,
    message: 'Borrow reports retrieved',
    data
  });
});

export const getMostPopularBooksReport = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req);
  const data = await analyticsService.getMostPopularBooks(filters);

  res.json({
    success: true,
    message: 'Most popular books report retrieved',
    data
  });
});

export const getReadingTrendsReport = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseReportFilters(req);
  const data = await analyticsService.getReadingTrends(filters);

  res.json({
    success: true,
    message: 'Reading trends report retrieved',
    data
  });
});

export const exportReports = asyncHandler(async (req: Request, res: Response) => {
  const type = (req.query.type as string | undefined) || 'monthly';
  const format = ((req.query.format as string | undefined) || 'csv').toLowerCase();
  const filters = parseReportFilters(req);

  const validTypes = ['monthly', 'department', 'borrow', 'popular-books', 'reading-trends'];
  if (!validTypes.includes(type)) {
    throw new AppError('Invalid report type', 400);
  }

  if (format !== 'csv' && format !== 'excel') {
    throw new AppError('Invalid export format', 400);
  }

  const exported = await analyticsService.exportReport(
    type as 'monthly' | 'department' | 'borrow' | 'popular-books' | 'reading-trends',
    format as 'csv' | 'excel',
    filters
  );

  const dateTag = new Date().toISOString().slice(0, 10);
  const fileName = `${type}-report-${dateTag}.${exported.extension}`;

  res.setHeader('Content-Type', exported.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.status(200).send(exported.content);
});

export default {
  getDashboardStats,
  getMostBorrowedBooks,
  getLeastBorrowedBooks,
  getLateReturns,
  getBorrowStatusDistribution,
  getBorrowTrendLastDays,
  getUsersByRole,
  getRecentActivity,
  getBooksByCategory,
  getCategoryBorrowStats,
  getOverdueStats,
  getGlobalWishlistCount,
  getGlobalDueSoonBorrows,
  getComprehensiveDashboard,
  getUserStatistics,
  getTrendingBooks,
  getReportingDashboard,
  getMonthlyReports,
  getDepartmentReports,
  getBorrowReports,
  getMostPopularBooksReport,
  getReadingTrendsReport,
  exportReports
};
