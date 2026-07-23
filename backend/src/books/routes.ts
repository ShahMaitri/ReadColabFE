import { Router } from 'express';
import * as bookController from './controller';
import { authenticate, authorize, isAdmin } from '../middleware/authenticate';
import { upload } from '../common/upload';
import { getBookReviews, getBookRating, getReviewEligibility } from '../review/controller';

export const booksRouter = Router();

// Public routes
booksRouter.get('/', bookController.getBooks);
booksRouter.get('/search', bookController.searchBooks);
booksRouter.get('/categories', bookController.getCategories);
booksRouter.get('/:bookId/reviews', getBookReviews);
booksRouter.get('/:bookId/rating', getBookRating);
booksRouter.get('/:bookId/review-eligibility', authenticate, getReviewEligibility);
booksRouter.get('/:id', bookController.getBook);

// Admin routes
booksRouter.post('/', authenticate, isAdmin, bookController.createBook);
booksRouter.patch('/:id', authenticate, isAdmin, bookController.updateBook);
booksRouter.delete('/:id', authenticate, isAdmin, bookController.deleteBook);
booksRouter.post(
  '/:id/cover',
  authenticate,
  isAdmin,
  upload.single('cover'),
  bookController.uploadCover
);
booksRouter.delete('/:id/cover', authenticate, isAdmin, bookController.removeCover);
booksRouter.post('/:id/qr-code', authenticate, isAdmin, bookController.generateQRCode);
