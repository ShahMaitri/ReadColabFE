import { wishlistRepository } from '../repositories/wishlist.repository';
import { bookRepository } from '../repositories/book.repository';
import { AppError } from '../utils/appError';
import { Wishlist } from '@prisma/client';

export class WishlistService {
  async addToWishlist(userId: string, bookId: string): Promise<Wishlist> {
    // Verify book exists
    const book = await bookRepository.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if already in wishlist
    const existing = await wishlistRepository.findByUserAndBook(userId, bookId);
    if (existing) {
      throw new AppError('Book already in wishlist', 409);
    }

    return wishlistRepository.addToWishlist(userId, bookId);
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<Wishlist> {
    // Verify it exists
    const wishlist = await wishlistRepository.findByUserAndBook(userId, bookId);
    if (!wishlist) {
      throw new AppError('Book not in wishlist', 404);
    }

    return wishlistRepository.removeFromWishlist(userId, bookId);
  }

  async getWishlist(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Wishlist[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const [wishlist, total] = await Promise.all([
      wishlistRepository.findByUserId(userId, limit, offset),
      wishlistRepository.countByUserId(userId)
    ]);

    return {
      data: wishlist,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async isInWishlist(userId: string, bookId: string): Promise<boolean> {
    return wishlistRepository.isInWishlist(userId, bookId);
  }

  async getWishlistCount(userId: string): Promise<number> {
    return wishlistRepository.countByUserId(userId);
  }
}

export const wishlistService = new WishlistService();
