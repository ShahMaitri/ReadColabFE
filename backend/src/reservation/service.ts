import { Reservation } from '@prisma/client';
import { ReservationRepository } from '../repositories/reservation.repository';
import { BookRepository } from '../repositories/book.repository';
import { AppError } from '../utils/appError';
import { prisma } from '../config/prisma';
import { NotificationService } from '../notifications';

const reservationRepository = new ReservationRepository(prisma);
const bookRepository = new BookRepository();

const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  READY: 'READY',
  CANCELLED: 'CANCELLED'
} as const;

export class ReservationService {
  // Request to reserve a book
  static async requestReservation(userId: string, bookId: string): Promise<Reservation> {
    // Check if book exists
    const book = await bookRepository.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if user already has a reservation for this book
    const existingReservation = await reservationRepository.findByUserAndBook(
      userId,
      bookId
    );
    if (existingReservation) {
      if (existingReservation.status === RESERVATION_STATUS.CANCELLED) {
        const pendingCount = await prisma.reservation.count({
          where: {
            bookId,
            status: RESERVATION_STATUS.PENDING,
          },
        });

        const reactivatedReservation = await prisma.reservation.update({
          where: { id: existingReservation.id },
          data: {
            status: RESERVATION_STATUS.PENDING,
            position: pendingCount + 1,
          },
        });

        return reactivatedReservation;
      }

      throw new AppError('You already have a reservation for this book', 409);
    }

    // If book is available, cannot reserve
    if (book.availableQuantity > 0) {
      throw new AppError(
        'Book is currently available for borrowing. No need to reserve.',
        400
      );
    }

    // Create reservation
    const reservation = await reservationRepository.create({
      userId,
      bookId,
    });

    return reservation;
  }

  // Cancel a reservation
  static async cancelReservation(reservationId: string, userId: string): Promise<Reservation> {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    // Check if user owns this reservation or is admin
    if (reservation.userId !== userId && (global as any).user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized to cancel this reservation', 403);
    }

    // Cancel the reservation
    const cancelled = await reservationRepository.cancel(reservationId);

    // Recalculate positions
    await reservationRepository.recalculatePositions(cancelled.bookId);

    return cancelled;
  }

  // Mark reservation as ready (book returned and next in queue)
  static async markAsReady(reservationId: string): Promise<Reservation> {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new AppError(
        `Reservation must be pending. Current status: ${reservation.status}`,
        400
      );
    }

    const updated = await reservationRepository.updateStatus(reservationId, RESERVATION_STATUS.READY);
    await NotificationService.notifyReservationReady(updated);

    return updated;
  }

  // Get user's reservations
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    return reservationRepository.findByUserId(userId);
  }

  // Get reservation queue for a book
  static async getReservationQueue(bookId: string): Promise<Reservation[]> {
    return reservationRepository.findQueueByBookId(bookId);
  }

  // Get next person in queue for a book
  static async getNextInQueue(bookId: string): Promise<Reservation | null> {
    return reservationRepository.getNextInQueue(bookId);
  }

  // Get ready reservations for user
  static async getReadyReservations(userId: string): Promise<Reservation[]> {
    return reservationRepository.findReadyByUserId(userId);
  }

  // Move to next in queue when book is returned
  static async processNextReservation(bookId: string): Promise<Reservation | null> {
    const next = await reservationRepository.getNextInQueue(bookId);

    if (!next) {
      return null;
    }

    // Mark as ready
    const updated = await reservationRepository.updateStatus(next.id, RESERVATION_STATUS.READY);
    await NotificationService.notifyReservationReady(updated);

    return updated;
  }

  // Fulfill a ready reservation (convert to borrow)
  static async fulfillReservation(reservationId: string): Promise<Reservation> {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    if (reservation.status !== RESERVATION_STATUS.READY) {
      throw new AppError(
        `Reservation must be ready. Current status: ${reservation.status}`,
        400
      );
    }

    // Delete the reservation (it's now fulfilled)
    return reservationRepository.delete(reservationId);
  }

  // Cancel expired ready reservations (if not picked up within 3 days)
  static async cancelExpiredReady(): Promise<number> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 3);

    const readyReservations = await prisma.reservation.findMany({
      where: {
        status: RESERVATION_STATUS.READY,
        updatedAt: {
          lt: thresholdDate,
        },
      },
    });

    let count = 0;
    for (const reservation of readyReservations) {
      await reservationRepository.cancel(reservation.id);
      // Recalculate positions for the book
      await reservationRepository.recalculatePositions(reservation.bookId);
      count++;
    }

    return count;
  }
}
