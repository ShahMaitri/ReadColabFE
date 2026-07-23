import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
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
  getGlobalReadingStatistics,
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
} from './controller';

const analyticsRouter = Router();

// All analytics routes require authentication
analyticsRouter.use(authenticate);

// Main dashboard endpoint
analyticsRouter.get('/dashboard', getComprehensiveDashboard);

// Individual stats endpoints
analyticsRouter.get('/stats', getDashboardStats);
analyticsRouter.get('/books/most-borrowed', getMostBorrowedBooks);
analyticsRouter.get('/books/least-borrowed', getLeastBorrowedBooks);
analyticsRouter.get('/books/by-category', getBooksByCategory);
analyticsRouter.get('/trending-books', getTrendingBooks);
analyticsRouter.get('/borrows/status-distribution', getBorrowStatusDistribution);
analyticsRouter.get('/borrows/trend', getBorrowTrendLastDays);
analyticsRouter.get('/borrows/late-returns', getLateReturns);
analyticsRouter.get('/borrows/category-stats', getCategoryBorrowStats);
analyticsRouter.get('/users/by-role', getUsersByRole);
analyticsRouter.get('/activity/recent', getRecentActivity);
analyticsRouter.get('/overdue/stats', getOverdueStats);
analyticsRouter.get('/wishlist/count', getGlobalWishlistCount);
analyticsRouter.get('/borrows/due-soon', getGlobalDueSoonBorrows);
analyticsRouter.get('/reading-stats/global', getGlobalReadingStatistics);
analyticsRouter.get('/user-stats', getUserStatistics);

// Reporting module
analyticsRouter.get('/reports/dashboard', getReportingDashboard);
analyticsRouter.get('/reports/monthly', getMonthlyReports);
analyticsRouter.get('/reports/departments', getDepartmentReports);
analyticsRouter.get('/reports/borrows', getBorrowReports);
analyticsRouter.get('/reports/popular-books', getMostPopularBooksReport);
analyticsRouter.get('/reports/reading-trends', getReadingTrendsReport);
analyticsRouter.get('/reports/export', exportReports);

export default analyticsRouter;
