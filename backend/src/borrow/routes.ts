import { Router } from 'express';
import * as borrowController from './controller';
import { authenticate, isAdmin } from '../middleware/authenticate';

const borrowRouter = Router();

// User routes
borrowRouter.post(
  '/',
  authenticate,
  borrowController.requestBorrow
);

borrowRouter.get(
  '/active',
  authenticate,
  borrowController.getActiveBorrows
);

borrowRouter.get(
  '/history',
  authenticate,
  borrowController.getBorrowHistory
);

borrowRouter.patch(
  '/:id/confirm',
  authenticate,
  borrowController.confirmBorrow
);

borrowRouter.patch(
  '/:id/return',
  authenticate,
  borrowController.returnBook
);

// Admin routes
borrowRouter.get(
  '/pending',
  authenticate,
  isAdmin,
  borrowController.getPendingRequests
);

borrowRouter.patch(
  '/:id/approve',
  authenticate,
  isAdmin,
  borrowController.approveBorrow
);

borrowRouter.patch(
  '/:id/reject',
  authenticate,
  isAdmin,
  borrowController.rejectBorrow
);

borrowRouter.get(
  '/statistics',
  authenticate,
  isAdmin,
  borrowController.getStatistics
);

// Dashboard routes
borrowRouter.get(
  '/user/books',
  authenticate,
  borrowController.getUserBorrowsWithBooks
);

borrowRouter.get(
  '/user/due-soon',
  authenticate,
  borrowController.getDueSoonBooks
);

export { borrowRouter };
