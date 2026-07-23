import { prisma } from '../config/prisma';

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  department?: string;
}

const buildDateWhere = (filters: ReportFilters) => {
  if (!filters.startDate && !filters.endDate) {
    return undefined;
  }

  return {
    gte: filters.startDate,
    lte: filters.endDate
  };
};

const normalizeDepartment = (role?: string | null): string => role || 'UNASSIGNED';

export class AnalyticsRepository {
  async getDashboardStats() {
    const [totalBooks, totalUsers, totalBorrows, totalReservations, activeLoans] =
      await Promise.all([
        prisma.book.count(),
        prisma.user.count(),
        prisma.borrow.count(),
        prisma.reservation.count(),
        prisma.borrow.count({
          where: {
            status: 'BORROWED'
          }
        })
      ]);

    return {
      totalBooks,
      totalUsers,
      totalBorrows,
      totalReservations,
      activeLoans
    };
  }

  async getMostBorrowedBooks(limit: number = 10) {
    const books = await prisma.borrow.groupBy({
      by: ['bookId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    const bookDetails = await Promise.all(
      books.map(async (item: any) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          select: { id: true, title: true, author: true, category: true }
        });
        return {
          ...book,
          borrowCount: item._count.id
        };
      })
    );

    return bookDetails;
  }

  async getLeastBorrowedBooks(limit: number = 10) {
    const allBooks = await prisma.book.findMany({
      select: { id: true, title: true, author: true, category: true }
    });

    const borrowCounts = await prisma.borrow.groupBy({
      by: ['bookId'],
      _count: {
        id: true
      }
    });

    const borrowMap = new Map(borrowCounts.map((b: any) => [b.bookId, b._count.id]));

    const withCounts = allBooks.map((book: any) => ({
      ...book,
      borrowCount: borrowMap.get(book.id) || 0
    }));

    return withCounts.sort((a: any, b: any) => a.borrowCount - b.borrowCount).slice(0, limit);
  }

  async getLateReturns() {
    const now = new Date();
    const lateReturns = await prisma.borrow.findMany({
      where: {
        status: 'BORROWED',
        dueDate: {
          lt: now
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        book: {
          select: { id: true, title: true }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return lateReturns;
  }

  async getBorrowStatusDistribution() {
    const distribution = await prisma.borrow.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    return distribution.map((item: any) => ({
      status: item.status,
      count: item._count.id
    }));
  }

  async getBorrowTrendLastDays(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const borrows = await prisma.borrow.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date (day only)
    const grouped: Record<string, number> = {};
    borrows.forEach((item: any) => {
      const date = item.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + item._count.id;
    });

    return Object.entries(grouped).map(([date, count]: any) => ({
      date,
      count
    }));
  }

  async getUsersByRole() {
    const distribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    return distribution.map((item: any) => ({
      role: item.role,
      count: item._count.id
    }));
  }

  async getRecentActivity(limit: number = 20) {
    const [recentBorrows, recentReturns, recentReservations] = await Promise.all([
      prisma.borrow.findMany({
        where: { status: 'BORROWED' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit / 3
      }),
      prisma.borrow.findMany({
        where: { status: 'RETURNED' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true } }
        },
        orderBy: { returnDate: 'desc' },
        take: limit / 3
      }),
      prisma.reservation.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit / 3
      })
    ]);

    const activity = [
      ...recentBorrows.map((b: any) => ({
        id: b.id,
        type: 'borrow',
        user: b.user,
        book: b.book,
        timestamp: b.createdAt,
        status: b.status
      })),
      ...recentReturns.map((b: any) => ({
        id: b.id,
        type: 'return',
        user: b.user,
        book: b.book,
        timestamp: b.returnDate || new Date(),
        status: b.status
      })),
      ...recentReservations.map((r: any) => ({
        id: r.id,
        type: 'reservation',
        user: r.user,
        book: r.book,
        timestamp: r.createdAt,
        status: r.status
      }))
    ];

    return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  async getBooksByCategory() {
    const distribution = await prisma.book.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    return distribution
      .map((item: any) => ({
        category: item.category || 'Uncategorized',
        count: item._count.id
      }))
      .sort((a: any, b: any) => b.count - a.count);
  }

  async getCategoryBorrowStats() {
    const stats = await prisma.borrow.findMany({
      include: {
        book: {
          select: { category: true }
        }
      }
    });

    const grouped: Record<string, number> = {};
    stats.forEach((borrow: any) => {
      const category = borrow.book.category || 'Uncategorized';
      grouped[category] = (grouped[category] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([category, count]: [string, number]) => ({
        category,
        borrowCount: count
      }))
      .sort((a: any, b: any) => b.borrowCount - a.borrowCount);
  }

  async getOverdueStats() {
    const now = new Date();
    const overdueCount = await prisma.borrow.count({
      where: {
        status: 'BORROWED',
        dueDate: {
          lt: now
        }
      }
    });

    const overduePercentage = await prisma.borrow.findMany({
      where: { status: 'BORROWED' }
    });

    return {
      overdueCount,
      totalActive: overduePercentage.length,
      overduePercentage:
        overduePercentage.length > 0 ? ((overdueCount / overduePercentage.length) * 100).toFixed(2) : 0
    };
  }

  async getMonthlyReports(filters: ReportFilters = {}) {
    const createdAt = buildDateWhere(filters);

    const borrows = await prisma.borrow.findMany({
      where: {
        ...(createdAt ? { createdAt } : {}),
        ...(filters.department
          ? {
              user: {
                role: filters.department
              }
            }
          : {})
      },
      include: {
        user: {
          select: {
            role: true
          }
        }
      }
    });

    const grouped: Record<string, { month: string; totalBorrows: number; returned: number; overdue: number; active: number; departments: Set<string> }> = {};

    borrows.forEach((borrow) => {
      const month = borrow.createdAt.toISOString().slice(0, 7);

      if (!grouped[month]) {
        grouped[month] = {
          month,
          totalBorrows: 0,
          returned: 0,
          overdue: 0,
          active: 0,
          departments: new Set<string>()
        };
      }

      grouped[month].totalBorrows += 1;
      grouped[month].departments.add(normalizeDepartment(borrow.user?.role));

      if (borrow.status === 'RETURNED') {
        grouped[month].returned += 1;
      }
      if (borrow.status === 'OVERDUE') {
        grouped[month].overdue += 1;
      }
      if (borrow.status === 'BORROWED' || borrow.status === 'APPROVED') {
        grouped[month].active += 1;
      }
    });

    return Object.values(grouped)
      .map((item) => ({
        month: item.month,
        totalBorrows: item.totalBorrows,
        returned: item.returned,
        overdue: item.overdue,
        active: item.active,
        departmentCount: item.departments.size
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getDepartmentReports(filters: ReportFilters = {}) {
    const createdAt = buildDateWhere(filters);

    const borrows = await prisma.borrow.findMany({
      where: {
        ...(createdAt ? { createdAt } : {})
      },
      include: {
        user: {
          select: {
            role: true
          }
        }
      }
    });

    const grouped: Record<string, { department: string; totalBorrows: number; returned: number; overdue: number }> = {};

    borrows.forEach((borrow) => {
      const department = normalizeDepartment(borrow.user?.role);

      if (filters.department && department !== filters.department) {
        return;
      }

      if (!grouped[department]) {
        grouped[department] = {
          department,
          totalBorrows: 0,
          returned: 0,
          overdue: 0
        };
      }

      grouped[department].totalBorrows += 1;
      if (borrow.status === 'RETURNED') {
        grouped[department].returned += 1;
      }
      if (borrow.status === 'OVERDUE') {
        grouped[department].overdue += 1;
      }
    });

    return Object.values(grouped).sort((a, b) => b.totalBorrows - a.totalBorrows);
  }

  async getBorrowReports(filters: ReportFilters = {}) {
    const createdAt = buildDateWhere(filters);

    return prisma.borrow.findMany({
      where: {
        ...(createdAt ? { createdAt } : {}),
        ...(filters.department
          ? {
              user: {
                role: filters.department
              }
            }
          : {})
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        book: {
          select: {
            title: true,
            author: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getMostPopularBooks(filters: ReportFilters = {}) {
    const createdAt = buildDateWhere(filters);

    const grouped = await prisma.borrow.groupBy({
      by: ['bookId'],
      where: {
        ...(createdAt ? { createdAt } : {}),
        ...(filters.department
          ? {
              user: {
                role: filters.department
              }
            }
          : {})
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20
    });

    const books = await Promise.all(
      grouped.map(async (item) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          select: {
            id: true,
            title: true,
            author: true,
            category: true
          }
        });

        return {
          ...book,
          borrowCount: item._count.id
        };
      })
    );

    return books.filter((book) => Boolean(book.id));
  }

  async getReadingTrends(filters: ReportFilters = {}) {
    const createdAt = buildDateWhere(filters);
    const borrows = await prisma.borrow.findMany({
      where: {
        ...(createdAt ? { createdAt } : {}),
        ...(filters.department
          ? {
              user: {
                role: filters.department
              }
            }
          : {})
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const grouped: Record<string, { date: string; requested: number; returned: number; overdue: number }> = {};

    borrows.forEach((borrow) => {
      const date = borrow.createdAt.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = {
          date,
          requested: 0,
          returned: 0,
          overdue: 0
        };
      }

      grouped[date].requested += 1;
      if (borrow.status === 'RETURNED') {
        grouped[date].returned += 1;
      }
      if (borrow.status === 'OVERDUE') {
        grouped[date].overdue += 1;
      }
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const analyticsRepository = new AnalyticsRepository();
