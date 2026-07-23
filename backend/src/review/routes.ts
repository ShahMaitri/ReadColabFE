import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  createReview,
  getReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getBookRating
} from './controller';

const reviewRouter = Router();

// User routes
reviewRouter.post('/', authenticate, createReview);
reviewRouter.get('/user/me', authenticate, getUserReviews);
reviewRouter.get('/:id', getReview);
reviewRouter.patch('/:id', authenticate, updateReview);
reviewRouter.delete('/:id', authenticate, deleteReview);

// Book reviews
reviewRouter.get('/book/:bookId', getBookReviews);
reviewRouter.get('/book/:bookId/rating', getBookRating);

export default reviewRouter;
