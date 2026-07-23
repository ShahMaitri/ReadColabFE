import { analyticsRepository } from '../repositories/analytics.repository';

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  department?: string;
}

type ReportType = 'monthly' | 'department' | 'borrow' | 'popular-books' | 'reading-trends';

const escapeCsvCell = (value: unknown): string => {
  const stringValue = value === null || value === undefined ? '' : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const toCsv = (rows: Record<string, unknown>[]): string => {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(','));

  return [headerLine, ...bodyLines].join('\n');
};

const toExcelXml = (rows: Record<string, unknown>[]): string => {
  const headers = rows.length ? Object.keys(rows[0]) : [];

  const encode = (input: string): string =>
    input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const headerXml = headers
    .map((header) => `<Cell><Data ss:Type="String">${encode(header)}</Data></Cell>`)
    .join('');

  const bodyXml = rows
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header];
          const type = typeof value === 'number' ? 'Number' : 'String';
          return `<Cell><Data ss:Type="${type}">${encode(value === null || value === undefined ? '' : String(value))}</Data></Cell>`;
        })
        .join('');

      return `<Row>${cells}</Row>`;
    })
    .join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Report">
    <Table>
      <Row>${headerXml}</Row>
      ${bodyXml}
    </Table>
  </Worksheet>
</Workbook>`;
};

export class AnalyticsService {
  async getDashboardStats() {
    return analyticsRepository.getDashboardStats();
  }

  async getMostBorrowedBooks(limit: number = 10) {
    return analyticsRepository.getMostBorrowedBooks(limit);
  }

  async getLeastBorrowedBooks(limit: number = 10) {
    return analyticsRepository.getLeastBorrowedBooks(limit);
  }

  async getLateReturns() {
    return analyticsRepository.getLateReturns();
  }

  async getBorrowStatusDistribution() {
    return analyticsRepository.getBorrowStatusDistribution();
  }

  async getBorrowTrendLastDays(days: number = 30) {
    return analyticsRepository.getBorrowTrendLastDays(days);
  }

  async getUsersByRole() {
    return analyticsRepository.getUsersByRole();
  }

  async getRecentActivity(limit: number = 20) {
    return analyticsRepository.getRecentActivity(limit);
  }

  async getBooksByCategory() {
    return analyticsRepository.getBooksByCategory();
  }

  async getCategoryBorrowStats() {
    return analyticsRepository.getCategoryBorrowStats();
  }

  async getOverdueStats() {
    return analyticsRepository.getOverdueStats();
  }

  async getGlobalWishlistCount() {
    return analyticsRepository.getGlobalWishlistCount();
  }

  async getGlobalDueSoonBorrows(days: number = 7) {
    return analyticsRepository.getGlobalDueSoonBorrows(days);
  }

  async getGlobalReadingStatistics() {
    const { prisma } = await import('../config/prisma');

    const [totalBorrowed, totalReturned, totalOverdue, booksWishlisted, booksReviewed] = await Promise.all([
      prisma.borrow.count(),
      prisma.borrow.count({
        where: { status: 'RETURNED' }
      }),
      prisma.borrow.count({
        where: { status: 'OVERDUE' }
      }),
      prisma.wishlist.count(),
      prisma.review.count()
    ]);

    const reviews = await prisma.review.findMany({
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      totalBorrowed,
      totalReturned,
      totalOverdue,
      booksWishlisted,
      booksReviewed,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }

  async getComprehensiveDashboard() {
    const [
      stats,
      mostBorrowed,
      leastBorrowed,
      lateReturns,
      borrowStatusDist,
      borrowTrend,
      usersByRole,
      recentActivity,
      booksByCategory,
      categoryBorrowStats,
      overdueStats
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getMostBorrowedBooks(5),
      this.getLeastBorrowedBooks(5),
      this.getLateReturns(),
      this.getBorrowStatusDistribution(),
      this.getBorrowTrendLastDays(30),
      this.getUsersByRole(),
      this.getRecentActivity(15),
      this.getBooksByCategory(),
      this.getCategoryBorrowStats(),
      this.getOverdueStats()
    ]);

    return {
      stats,
      mostBorrowed,
      leastBorrowed,
      lateReturns,
      borrowStatusDist,
      borrowTrend,
      usersByRole,
      recentActivity,
      booksByCategory,
      categoryBorrowStats,
      overdueStats
    };
  }

  async getUserStatistics(userId: string) {
    const { prisma } = await import('../config/prisma');

    const [totalBorrowed, totalReturned, totalOverdue, booksWishlisted, booksReviewed] = await Promise.all([
      prisma.borrow.count({
        where: { userId }
      }),
      prisma.borrow.count({
        where: { userId, status: 'RETURNED' }
      }),
      prisma.borrow.count({
        where: { userId, status: 'OVERDUE' }
      }),
      prisma.wishlist.count({
        where: { userId }
      }),
      prisma.review.count({
        where: { userId }
      })
    ]);

    const reviews = await prisma.review.findMany({
      where: { userId },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      totalBorrowed,
      totalReturned,
      totalOverdue,
      booksWishlisted,
      booksReviewed,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }

  async getMonthlyReports(filters: ReportFilters = {}) {
    return analyticsRepository.getMonthlyReports(filters);
  }

  async getDepartmentReports(filters: ReportFilters = {}) {
    return analyticsRepository.getDepartmentReports(filters);
  }

  async getBorrowReports(filters: ReportFilters = {}) {
    const borrows = await analyticsRepository.getBorrowReports(filters);

    return borrows.map((borrow) => ({
      id: borrow.id,
      borrowedAt: borrow.createdAt,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      returnDate: borrow.returnDate,
      status: borrow.status,
      userName: borrow.user?.name,
      userEmail: borrow.user?.email,
      department: borrow.user?.role || 'UNASSIGNED',
      bookTitle: borrow.book?.title,
      bookAuthor: borrow.book?.author,
      category: borrow.book?.category || 'Uncategorized'
    }));
  }

  async getMostPopularBooks(filters: ReportFilters = {}) {
    return analyticsRepository.getMostPopularBooks(filters);
  }

  async getReadingTrends(filters: ReportFilters = {}) {
    return analyticsRepository.getReadingTrends(filters);
  }

  async getReportingDashboard(filters: ReportFilters = {}) {
    const [monthly, departments, borrows, popularBooks, readingTrends] = await Promise.all([
      this.getMonthlyReports(filters),
      this.getDepartmentReports(filters),
      this.getBorrowReports(filters),
      this.getMostPopularBooks(filters),
      this.getReadingTrends(filters)
    ]);

    return {
      monthly,
      departments,
      borrows,
      popularBooks,
      readingTrends
    };
  }

  async exportReport(type: ReportType, format: 'csv' | 'excel', filters: ReportFilters = {}) {
    const dataMap = {
      monthly: await this.getMonthlyReports(filters),
      department: await this.getDepartmentReports(filters),
      borrow: await this.getBorrowReports(filters),
      'popular-books': await this.getMostPopularBooks(filters),
      'reading-trends': await this.getReadingTrends(filters)
    };

    const rows = (dataMap[type] as Record<string, unknown>[]).map((row) => {
      const normalized: Record<string, unknown> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalized[key] = value instanceof Date ? value.toISOString() : value;
      });
      return normalized;
    });

    if (format === 'excel') {
      return {
        content: toExcelXml(rows),
        contentType: 'application/vnd.ms-excel',
        extension: 'xls'
      };
    }

    return {
      content: toCsv(rows),
      contentType: 'text/csv',
      extension: 'csv'
    };
  }
}

export const analyticsService = new AnalyticsService();
