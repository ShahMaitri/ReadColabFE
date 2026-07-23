import { Router } from 'express';
import * as reservationController from './controller';
import { authenticate } from '../middleware/authenticate';

const reservationRouter = Router();

// User routes
reservationRouter.post(
  '/',
  authenticate,
  reservationController.reserveBook
);

reservationRouter.get(
  '/',
  authenticate,
  reservationController.getUserReservations
);

reservationRouter.delete(
  '/:id',
  authenticate,
  reservationController.cancelReservation
);

reservationRouter.get(
  '/ready',
  authenticate,
  reservationController.getReadyReservations
);

// Public routes
reservationRouter.get(
  '/queue/:bookId',
  reservationController.getReservationQueue
);

export { reservationRouter };
