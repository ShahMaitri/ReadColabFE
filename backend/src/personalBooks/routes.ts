/**
 * Personal Book Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as controller from './controller';

const router = Router();

// ==================== Personal Books ====================

// Browse personal books (public)
router.get('/', controller.searchPersonalBooks);

// Get specific personal book
router.get('/:id', controller.getPersonalBook);

// Create personal book
router.post('/', authenticate, controller.createPersonalBook);

// Update personal book
router.put('/:id', authenticate, controller.updatePersonalBook);

// Delete personal book
router.delete('/:id', authenticate, controller.deletePersonalBook);

// Get my personal books
router.get('/user/my-books', authenticate, controller.getMyPersonalBooks);

// ==================== Borrow Requests ====================

// Request a book
router.post('/:bookId/request', authenticate, controller.requestBook);

// Approve borrow request
router.patch('/request/:id/approve', authenticate, controller.approveBorrowRequest);

// Reject borrow request
router.patch('/request/:id/reject', authenticate, controller.rejectBorrowRequest);

// Mark book as returned
router.patch('/request/:id/return', authenticate, controller.markAsReturned);

// Get pending requests (for owner)
router.get('/owner/pending', authenticate, controller.getPendingRequests);

// Get my borrowed books
router.get('/borrower/my-borrowed', authenticate, controller.getMyBorrowedBooks);

// ==================== Reviews ====================

// Create review
router.post('/:bookId/reviews', authenticate, controller.createReview);

// Get book reviews
router.get('/:bookId/reviews', controller.getBookReviews);

// ==================== Owner Profile ====================

// Get owner profile
router.get('/owner/:ownerId/profile', controller.getOwnerProfile);

// ==================== Settings ====================

// Get settings
router.get('/settings/me', authenticate, controller.getSettings);

// Update settings
router.put('/settings/me', authenticate, controller.updateSettings);

export const personalBooksRouter = router;
