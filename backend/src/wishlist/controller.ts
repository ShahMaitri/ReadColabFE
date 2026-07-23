import { Request, Response } from 'express';
import { wishlistService } from './service';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';
import { addToWishlistSchema } from './validation';

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = addToWishlistSchema.parse(req.body);
  const userId = (req as any).user.id;

  const wishlist = await wishlistService.addToWishlist(userId, bookId);

  res.status(201).json({
    success: true,
    message: 'Added to wishlist',
    data: wishlist
  });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = (req as any).user.id;

  const wishlist = await wishlistService.removeFromWishlist(userId, bookId);

  res.status(204).json({
    success: true,
    message: 'Removed from wishlist',
    data: wishlist
  });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await wishlistService.getWishlist(userId, page, limit);

  res.json({
    success: true,
    message: 'Wishlist retrieved',
    data: result.data,
    pagination: {
      total: result.total,
      page,
      limit,
      pages: result.pages
    }
  });
});

export const isInWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = (req as any).user.id;

  const inWishlist = await wishlistService.isInWishlist(userId, bookId);

  res.json({
    success: true,
    message: 'Wishlist status retrieved',
    data: { inWishlist }
  });
});

export const getWishlistCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const count = await wishlistService.getWishlistCount(userId);

  res.json({
    success: true,
    message: 'Wishlist count retrieved',
    data: { count }
  });
});

export default {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist,
  getWishlistCount
};
