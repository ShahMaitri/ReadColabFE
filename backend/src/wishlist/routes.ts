import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist,
  getWishlistCount
} from './controller';

const wishlistRouter = Router();

// User routes (all require authentication)
wishlistRouter.post('/', authenticate, addToWishlist);
wishlistRouter.get('/', authenticate, getWishlist);
wishlistRouter.delete('/:bookId', authenticate, removeFromWishlist);
wishlistRouter.get('/book/:bookId/status', authenticate, isInWishlist);
wishlistRouter.get('/count/total', authenticate, getWishlistCount);

export default wishlistRouter;
