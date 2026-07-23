import { prisma } from '../config/prisma';
import { Wishlist } from '@prisma/client';

export class WishlistRepository {
  async addToWishlist(userId: string, bookId: string): Promise<Wishlist> {
    return prisma.wishlist.create({
      data: { userId, bookId },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true, category: true, availableQuantity: true } },
        user: { select: { id: true, name: true } }
      }
    } as any);
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<Wishlist> {
    return prisma.wishlist.delete({
      where: { userId_bookId: { userId, bookId } },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true } },
        user: { select: { id: true, name: true } }
      }
    } as any);
  }

  async findById(id: string): Promise<Wishlist | null> {
    return prisma.wishlist.findUnique({
      where: { id },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true, category: true, availableQuantity: true } },
        user: { select: { id: true, name: true } }
      }
    } as any);
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<Wishlist | null> {
    return prisma.wishlist.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true } }
      }
    } as any);
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<Wishlist[]> {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        book: { select: { id: true, title: true, author: true, cover: true, category: true, availableQuantity: true, status: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    } as any);
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.wishlist.count({ where: { userId } });
  }

  async findByBookId(bookId: string): Promise<Wishlist[]> {
    return prisma.wishlist.findMany({
      where: { bookId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    } as any);
  }

  async isInWishlist(userId: string, bookId: string): Promise<boolean> {
    const wishlist = await this.findByUserAndBook(userId, bookId);
    return !!wishlist;
  }

  async delete(id: string): Promise<Wishlist> {
    return prisma.wishlist.delete({
      where: { id },
      include: {
        book: { select: { id: true, title: true } }
      }
    } as any);
  }
}

export const wishlistRepository = new WishlistRepository();
