import { Request, Response } from 'express';
import { ReservationService } from './service';
import { reserveBookSchema } from './validation';
import { asyncHandler } from '../utils/asyncHandler';

// Request to reserve a book
export const reserveBook = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = reserveBookSchema.parse(req.body);
  const userId = (req as any).user.id;

  const reservation = await ReservationService.requestReservation(userId, bookId);

  res.status(201).json({
    success: true,
    message: 'Book reserved successfully',
    data: reservation,
  });
});

// Cancel a reservation
export const cancelReservation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const reservation = await ReservationService.cancelReservation(id, userId);

  res.json({
    success: true,
    message: 'Reservation cancelled successfully',
    data: reservation,
  });
});

// Get user's reservations
export const getUserReservations = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const reservations = await ReservationService.getUserReservations(userId);

  res.json({
    success: true,
    message: 'Reservations retrieved',
    data: reservations,
  });
});

// Get reservation queue for a book
export const getReservationQueue = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;

  const queue = await ReservationService.getReservationQueue(bookId);

  res.json({
    success: true,
    message: 'Reservation queue retrieved',
    data: queue,
  });
});

// Get ready reservations for user
export const getReadyReservations = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const reservations = await ReservationService.getReadyReservations(userId);

  res.json({
    success: true,
    message: 'Ready reservations retrieved',
    data: reservations,
  });
});
