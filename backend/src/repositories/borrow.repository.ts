import { PrismaClient, Borrow } from '@prisma/client';

type BorrowStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'OVERDUE';

const BORROW_STATUS: Record<BorrowStatusValue, BorrowStatusValue> = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BORROWED: 'BORROWED',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE'
};

export class BorrowRepository {
  constructor(private prisma: PrismaClient) {}

  // Create a borrow request
  async create(data: {
    userId: string;
    bookId: string;
    status?: BorrowStatusValue;
  }): Promise<Borrow> {
    return this.prisma.borrow.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
        status: data.status || BORROW_STATUS.PENDING,
      },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Find borrow by ID
  async findById(id: string): Promise<Borrow | null> {
    return this.prisma.borrow.findUnique({
      where: { id },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Find user's current borrows (active)
  async findActiveByUserId(userId: string): Promise<Borrow[]> {
    return this.prisma.borrow.findMany({
      where: {
        userId,
        status: {
          in: [
            BORROW_STATUS.PENDING,
            BORROW_STATUS.APPROVED,
            BORROW_STATUS.BORROWED,
            BORROW_STATUS.OVERDUE
          ],
        },
      },
      include: {
        book: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Find all borrow history for a user
  async findAllByUserId(
    userId: string,
    skip: number = 0,
    take: number = 10
  ): Promise<{
    data: Borrow[];
    total: number;
  }> {
    const [data, total] = await Promise.all([
      this.prisma.borrow.findMany({
        where: { userId },
        include: {
          book: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.borrow.count({ where: { userId } }),
    ]);

    return { data, total };
  }

  // Find pending borrow requests for admin
  async findPending(skip: number = 0, take: number = 10): Promise<{
    data: Borrow[];
    total: number;
  }> {
    const [data, total] = await Promise.all([
      this.prisma.borrow.findMany({
        where: { status: BORROW_STATUS.PENDING },
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.borrow.count({ where: { status: BORROW_STATUS.PENDING } }),
    ]);

    return { data, total };
  }

  // Update borrow status
  async updateStatus(
    id: string,
    status: BorrowStatusValue,
    data?: {
      borrowDate?: Date;
      dueDate?: Date;
      returnDate?: Date;
    }
  ): Promise<Borrow> {
    return this.prisma.borrow.update({
      where: { id },
      data: {
        status,
        borrowDate: data?.borrowDate,
        dueDate: data?.dueDate,
        returnDate: data?.returnDate,
      },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Find overdue borrows
  async findOverdue(): Promise<Borrow[]> {
    const now = new Date();
    return this.prisma.borrow.findMany({
      where: {
        status: {
          in: [BORROW_STATUS.BORROWED, BORROW_STATUS.APPROVED],
        },
        dueDate: {
          lt: now,
        },
      },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Check if user already has this book borrowed
  async findActiveBorrowByUserAndBook(
    userId: string,
    bookId: string
  ): Promise<Borrow | null> {
    return this.prisma.borrow.findFirst({
      where: {
        userId,
        bookId,
        status: {
          in: [BORROW_STATUS.PENDING, BORROW_STATUS.APPROVED, BORROW_STATUS.BORROWED],
        },
      },
    });
  }

  // Get borrow count by status for admin
  async countByStatus(): Promise<Record<string, number>> {
    const counts = await this.prisma.borrow.groupBy({
      by: ['status'],
      _count: true,
    });

    const result: Record<string, number> = {};
    counts.forEach((count) => {
      result[count.status] = count._count;
    });

    return result;
  }

  // Delete a borrow request (for rejected/cancelled)
  async delete(id: string): Promise<Borrow> {
    return this.prisma.borrow.delete({
      where: { id },
      include: {
        book: true,
      },
    });
  }
}
