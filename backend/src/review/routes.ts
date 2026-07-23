import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  createReview,
  getReview,
  getBookReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getBookRating
} from './controller';

const reviewRouter = Router();

// User routes
reviewRouter.post('/', authenticate, createReview);
reviewRouter.get('/me', authenticate, getMyReviews);
reviewRouter.get('/:id', authenticate, getReview);
reviewRouter.patch('/:id', authenticate, updateReview);
reviewRouter.delete('/:id', authenticate, deleteReview);

// Legacy aliases for book reviews (book routes expose the canonical paths)
reviewRouter.get('/book/:bookId', getBookReviews);
reviewRouter.get('/book/:bookId/rating', getBookRating);

export default reviewRouter;
