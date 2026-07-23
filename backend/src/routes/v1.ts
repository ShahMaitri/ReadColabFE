import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { authRouter } from './auth.routes';
import { booksRouter } from '../books';
import { borrowRouter } from '../borrow';
import { reservationRouter } from '../reservation';
import reviewRouter from '../review/routes';
import wishlistRouter from '../wishlist/routes';
import analyticsRouter from '../analytics/routes';
import adminRouter from '../admin/routes';
import { notificationsRouter } from '../notifications';
import { createAIRoutes } from '../ai/routes';
import { AIConfig } from '../config/ai.config';
import { personalBooksRouter } from '../personalBooks/routes';

export const v1Router = Router();

v1Router.get('/health', healthController);

// Initialize AI service for dependency injection
const aiService = AIConfig.initializeAIService();

// Feature routes
v1Router.use('/auth', authRouter);
v1Router.use('/books', booksRouter);
v1Router.use('/borrow', borrowRouter);
v1Router.use('/reservation', reservationRouter);
v1Router.use('/reviews', reviewRouter);
v1Router.use('/wishlist', wishlistRouter);
v1Router.use('/ai', createAIRoutes(aiService));
v1Router.use('/analytics', analyticsRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/users', Router());
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/personal-books', personalBooksRouter);
