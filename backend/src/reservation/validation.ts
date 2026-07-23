import { z } from 'zod';

export const reserveBookSchema = z.object({
  bookId: z.string().cuid('Invalid book ID'),
});

export const cancelReservationSchema = z.object({
  reservationId: z.string().cuid('Invalid reservation ID'),
});

export type ReserveBook = z.infer<typeof reserveBookSchema>;
export type CancelReservation = z.infer<typeof cancelReservationSchema>;
