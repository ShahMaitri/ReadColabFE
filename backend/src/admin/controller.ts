import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { NotificationService } from '../notifications';

// Books
export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      skip: offset,
      take: limit,
      include: { addedByUser: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.book.count()
  ]);

  res.json({
    success: true,
    message: 'Books retrieved',
    data: books,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const book = await prisma.book.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    message: 'Book updated successfully',
    data: book
  });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.book.delete({ where: { id } });

  res.status(204).json({
    success: true,
    message: 'Book deleted successfully'
  });
});

// Users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const role = req.query.role as string | undefined;
  const offset = (page - 1) * limit;

  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true }
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    message: 'Users retrieved',
    data: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    data: req.body,
    select: { id: true, name: true, email: true, role: true, avatar: true }
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });

  res.status(204).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Borrow Requests
export const getBorrowRequests = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  const where = status ? { status } : {};

  const [borrows, total] = await Promise.all([
    prisma.borrow.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.borrow.count({ where })
  ]);

  res.json({
    success: true,
    message: 'Borrow requests retrieved',
    data: borrows,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

export const approveBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const borrow = await prisma.borrow.findUnique({ where: { id } });

  if (!borrow) {
    throw new AppError('Borrow request not found', 404);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14-day loan period

  const updated = await prisma.borrow.update({
    where: { id },
    data: {
      status: 'APPROVED',
      borrowDate: new Date(),
      dueDate
    },
    include: { user: true, book: true }
  });

  await NotificationService.notifyBorrowApproved(updated);

  res.json({
    success: true,
    message: 'Borrow request approved',
    data: updated
  });
});

export const rejectBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const borrow = await prisma.borrow.findUnique({ where: { id } });

  if (!borrow) {
    throw new AppError('Borrow request not found', 404);
  }

  const updated = await prisma.borrow.update({
    where: { id },
    data: { status: 'REJECTED' },
    include: { user: true, book: true }
  });

  await NotificationService.notifyBookReturned(updated);

  res.json({
    success: true,
    message: 'Borrow request rejected',
    data: updated
  });
});

export const returnBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const borrow = await prisma.borrow.findUnique({ where: { id } });

  if (!borrow) {
    throw new AppError('Borrow request not found', 404);
  }

  const updated = await prisma.borrow.update({
    where: { id },
    data: {
      status: 'RETURNED',
      returnDate: new Date()
    },
    include: { user: true, book: true }
  });

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: updated
  });
});

// Reservations
export const getReservations = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  const where = status ? { status } : {};

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.reservation.count({ where })
  ]);

  res.json({
    success: true,
    message: 'Reservations retrieved',
    data: reservations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

export const cancelReservation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { user: true, book: true }
  });

  res.json({
    success: true,
    message: 'Reservation cancelled',
    data: updated
  });
});

export const markReservationReady = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'READY' },
    include: { user: true, book: true }
  });

  await NotificationService.notifyReservationReady(updated);

  res.json({
    success: true,
    message: 'Reservation marked as ready',
    data: updated
  });
});

export default {
  // Books
  getAllBooks,
  updateBook,
  deleteBook,
  // Users
  getAllUsers,
  updateUser,
  deleteUser,
  // Borrows
  getBorrowRequests,
  approveBorrow,
  rejectBorrow,
  returnBorrow,
  // Reservations
  getReservations,
  cancelReservation,
  markReservationReady
};
