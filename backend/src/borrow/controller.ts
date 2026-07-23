import { Request, Response } from 'express';
import { BorrowService } from './service';
import { borrowRequestSchema, returnBookSchema } from './validation';
import { asyncHandler } from '../utils/asyncHandler';

// Request to borrow a book
export const requestBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = borrowRequestSchema.parse(req.body);
  const userId = (req as any).user.id;

  const borrow = await BorrowService.requestBorrow(userId, bookId);

  res.status(201).json({
    success: true,
    message: 'Borrow request created successfully',
    data: borrow,
  });
});

// Approve borrow request (admin only)
export const approveBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const borrow = await BorrowService.approveBorrow(id);

  res.json({
    success: true,
    message: 'Borrow request approved',
    data: borrow,
  });
});

// Reject borrow request (admin only)
export const rejectBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const borrow = await BorrowService.rejectBorrow(id);

  res.json({
    success: true,
    message: 'Borrow request rejected',
    data: borrow,
  });
});

// Confirm borrow (user picks up the book)
export const confirmBorrow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const borrow = await BorrowService.confirmBorrow(id);

  res.json({
    success: true,
    message: 'Book confirmed for borrow',
    data: borrow,
  });
});

// Return a book
export const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const borrow = await BorrowService.returnBook(id);

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: borrow,
  });
});

// Get user's active borrows
export const getActiveBorrows = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const borrows = await BorrowService.getActiveBorrows(userId);

  res.json({
    success: true,
    message: 'Active borrows retrieved',
    data: borrows,
  });
});

// Get user's borrow history
export const getBorrowHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await BorrowService.getBorrowHistory(userId, page, limit);

  res.json({
    success: true,
    message: 'Borrow history retrieved',
    data: result,
  });
});

// Get pending requests (admin only)
export const getPendingRequests = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await BorrowService.getPendingRequests(page, limit);

  res.json({
    success: true,
    message: 'Pending requests retrieved',
    data: result,
  });
});

// Get statistics (admin only)
export const getStatistics = asyncHandler(async (req: Request, res: Response) => {
  const statistics = await BorrowService.getStatistics();

  res.json({
    success: true,
    message: 'Statistics retrieved',
    data: statistics,
  });
});

// Get user's borrows with book details for dashboard
export const getUserBorrowsWithBooks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const borrows = await BorrowService.getUserBorrowsWithBooks(userId);

  res.json({
    success: true,
    message: 'User borrows retrieved',
    data: borrows,
  });
});

// Get books due soon for user
export const getDueSoonBooks = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const dueSoonBooks = await BorrowService.getDueSoonBooks(userId);

  res.json({
    success: true,
    message: 'Due soon books retrieved',
    data: dueSoonBooks,
  });
});
