import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getAllBooks,
  updateBook,
  deleteBook,
  getAllUsers,
  updateUser,
  deleteUser,
  getBorrowRequests,
  approveBorrow,
  rejectBorrow,
  markBorrowed,
  returnBorrow,
  getReservations,
  cancelReservation,
  markReservationReady,
  getAdminReviews,
  deleteAdminReview
} from './controller';

const adminRouter = Router();

// Admin check middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Apply authentication to all admin routes
adminRouter.use(authenticate, requireAdmin);

// Books management
adminRouter.get('/books', getAllBooks);
adminRouter.patch('/books/:id', updateBook);
adminRouter.delete('/books/:id', deleteBook);

// Users management
adminRouter.get('/users', getAllUsers);
adminRouter.patch('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);

// Borrow requests management
adminRouter.get('/borrows', getBorrowRequests);
adminRouter.post('/borrows/:id/approve', approveBorrow);
adminRouter.post('/borrows/:id/reject', rejectBorrow);
adminRouter.post('/borrows/:id/borrow', markBorrowed);
adminRouter.post('/borrows/:id/return', returnBorrow);

// Reservations management
adminRouter.get('/reservations', getReservations);
adminRouter.post('/reservations/:id/cancel', cancelReservation);
adminRouter.post('/reservations/:id/ready', markReservationReady);

// Review management
adminRouter.get('/reviews', getAdminReviews);
adminRouter.delete('/reviews/:id', deleteAdminReview);

export default adminRouter;
