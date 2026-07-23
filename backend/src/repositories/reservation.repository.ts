import { PrismaClient, Reservation } from '@prisma/client';

type ReservationStatusValue = 'PENDING' | 'READY' | 'CANCELLED';

const RESERVATION_STATUS: Record<ReservationStatusValue, ReservationStatusValue> = {
  PENDING: 'PENDING',
  READY: 'READY',
  CANCELLED: 'CANCELLED'
};

export class ReservationRepository {
  constructor(private prisma: PrismaClient) {}

  // Create a reservation
  async create(data: {
    userId: string;
    bookId: string;
  }): Promise<Reservation> {
    // Get the current position in queue for this book
    const count = await this.prisma.reservation.count({
      where: {
        bookId: data.bookId,
        status: RESERVATION_STATUS.PENDING,
      },
    });

    return this.prisma.reservation.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
        status: RESERVATION_STATUS.PENDING,
        position: count + 1,
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

  // Find reservation by ID
  async findById(id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
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

  // Find user's reservations
  async findByUserId(userId: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' },
      ],
    });
  }

  // Find reservation queue for a book
  async findQueueByBookId(bookId: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: {
        bookId,
        status: RESERVATION_STATUS.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  // Check if user already has a reservation for this book
  async findByUserAndBook(userId: string, bookId: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
  }

  // Update reservation status
  async updateStatus(id: string, status: ReservationStatusValue): Promise<Reservation> {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
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

  // Cancel a reservation
  async cancel(id: string): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Delete the reservation
    await this.prisma.reservation.delete({ where: { id } });

    // Update positions for remaining reservations
    if (reservation.status === RESERVATION_STATUS.PENDING) {
      await this.prisma.reservation.updateMany({
        where: {
          bookId: reservation.bookId,
          status: RESERVATION_STATUS.PENDING,
          position: {
            gt: reservation.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    }

    return reservation;
  }

  // Get next reservation for a book
  async getNextInQueue(bookId: string): Promise<Reservation | null> {
    return this.prisma.reservation.findFirst({
      where: {
        bookId,
        status: RESERVATION_STATUS.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  // Get ready reservations for a user
  async findReadyByUserId(userId: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: {
        userId,
        status: RESERVATION_STATUS.READY,
      },
      include: {
        book: true,
      },
    });
  }

  // Delete a reservation
  async delete(id: string): Promise<Reservation> {
    return this.prisma.reservation.delete({
      where: { id },
      include: {
        book: true,
      },
    });
  }

  // Recalculate all positions for a book's queue
  async recalculatePositions(bookId: string): Promise<void> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        bookId,
        status: RESERVATION_STATUS.PENDING,
      },
      orderBy: { createdAt: 'asc' },
    });

    for (let i = 0; i < reservations.length; i++) {
      await this.prisma.reservation.update({
        where: { id: reservations[i].id },
        data: { position: i + 1 },
      });
    }
  }
}
