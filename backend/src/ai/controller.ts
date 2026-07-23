import { Request, Response } from 'express';
import { AIService } from './service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

export class AIController {
  constructor(private aiService: AIService) {}

  private isRateLimitError(error: unknown): boolean {
    const message = String((error as { message?: unknown })?.message || error || '').toLowerCase();
    return message.includes('429') || message.includes('too many requests') || message.includes('rate limit');
  }

  /**
   * Chat with AI assistant
   * POST /ai/chat
   * Body: { messages: { role: 'user' | 'assistant', content: string }[] }
   */
  chat = asyncHandler(async (req: Request, res: Response) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new AppError('Messages array is required', 400);
    }

    if (messages.length === 0) {
      throw new AppError('At least one message is required', 400);
    }

    let response: string;

    try {
      response = await this.aiService.chat(messages);
    } catch (error) {
      if (!this.isRateLimitError(error)) {
        throw error;
      }

      response = 'I am temporarily rate-limited by the AI provider. Please try again in a little while. I can still help with basic library guidance in the meantime.';
    }

    res.status(200).json({
      success: true,
      message: 'Chat response generated',
      data: {
        response,
        provider: this.aiService.getProviderInfo()
      }
    });
  });

  /**
   * Get book recommendations based on user preferences
   * POST /ai/recommendations
   * Body: { preferences: string }
   */
  recommendBooks = asyncHandler(async (req: Request, res: Response) => {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'string') {
      throw new AppError('Preferences string is required', 400);
    }

    if (preferences.trim().length === 0) {
      throw new AppError('Preferences cannot be empty', 400);
    }

    let recommendations: unknown;

    try {
      recommendations = await this.aiService.recommendBooks(preferences);
    } catch (error) {
      if (!this.isRateLimitError(error)) {
        throw error;
      }

      recommendations = [
        {
          title: 'Smart Library Suggestions',
          author: 'Read Colab',
          reason: 'I am temporarily rate-limited by the AI provider. Browse our featured collections or check back in a few moments for personalized recommendations.',
          isbn: 'temp'
        }
      ];
    }

    res.status(200).json({
      success: true,
      message: 'Book recommendations generated',
      data: {
        recommendations,
        provider: this.aiService.getProviderInfo()
      }
    });
  });

  /**
   * Summarize a book
   * POST /ai/summarize
   * Body: { title: string, content: string }
   */
  summarizeBook = asyncHandler(async (req: Request, res: Response) => {
    const { title, content } = req.body;

    if (!title || typeof title !== 'string') {
      throw new AppError('Book title is required', 400);
    }

    if (!content || typeof content !== 'string') {
      throw new AppError('Book content is required', 400);
    }

    let summary: string;

    try {
      summary = await this.aiService.summarizeBook(title, content);
    } catch (error) {
      if (!this.isRateLimitError(error)) {
        throw error;
      }

      summary = `I am temporarily rate-limited by the AI provider. The summary for "${title}" is temporarily unavailable. Please try again in a few moments.`;
    }

    res.status(200).json({
      success: true,
      message: 'Book summary generated',
      data: {
        title,
        summary,
        provider: this.aiService.getProviderInfo()
      }
    });
  });

  /**
   * Compare two books
   * POST /ai/compare
   * Body: { book1: string, book2: string }
   */
  compareBooks = asyncHandler(async (req: Request, res: Response) => {
    const { book1, book2 } = req.body;

    if (!book1 || typeof book1 !== 'string') {
      throw new AppError('First book title is required', 400);
    }

    if (!book2 || typeof book2 !== 'string') {
      throw new AppError('Second book title is required', 400);
    }

    if (book1.trim() === book2.trim()) {
      throw new AppError('Books must be different', 400);
    }

    let comparison: string;

    try {
      comparison = await this.aiService.compareBooks(book1, book2);
    } catch (error) {
      if (!this.isRateLimitError(error)) {
        throw error;
      }

      comparison = `I am temporarily rate-limited by the AI provider. The comparison between "${book1}" and "${book2}" is temporarily unavailable. Please try again in a few moments.`;
    }

    res.status(200).json({
      success: true,
      message: 'Book comparison generated',
      data: {
        book1,
        book2,
        comparison,
        provider: this.aiService.getProviderInfo()
      }
    });
  });

  /**
   * Semantic search across books
   * POST /ai/search
   * Body: { query: string, context: string[] }
   */
  semanticSearch = asyncHandler(async (req: Request, res: Response) => {
    const { query, context } = req.body;

    if (!query || typeof query !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    if (!context || !Array.isArray(context)) {
      throw new AppError('Context array is required', 400);
    }

    if (context.length === 0) {
      throw new AppError('Context array cannot be empty', 400);
    }

    let results: string[];

    try {
      results = await this.aiService.semanticSearch(query, context);
    } catch (error) {
      if (!this.isRateLimitError(error)) {
        throw error;
      }

      results = [
        `I am temporarily rate-limited by the AI provider. Semantic search for "${query}" is not available. Please try again in a few moments or use our standard search.`
      ];
    }

    res.status(200).json({
      success: true,
      message: 'Semantic search completed',
      data: {
        query,
        results,
        provider: this.aiService.getProviderInfo()
      }
    });
  });

  /**
   * Generate a personalized reading plan
   * POST /ai/reading-plan
   * Body: { genres: string[], duration: string }
   */
  generateReadingPlan = asyncHandler(async (req: Request, res: Response) => {
    const { genres, duration } = req.body;

    if (!genres || !Array.isArray(genres)) {
      throw new AppError('Genres array is required', 400);
    }

    if (genres.length === 0) {
      throw new AppError('At least one genre is required', 400);
    }

    if (!duration || typeof duration !== 'string') {
      throw new AppError('Duration is required (e.g., "2 weeks", "1 month")', 400);
    }

    const readingPlan = await this.aiService.generateReadingPlan(genres, duration);

    res.status(200).json({
      success: true,
      message: 'Reading plan generated',
      data: {
        genres,
        duration,
        readingPlan,
        provider: this.aiService.getProviderInfo()
      }
    });
  });

  /**
   * Get current AI provider information
   * GET /ai/provider
   */
  getProvider = asyncHandler(async (req: Request, res: Response) => {
    const providerInfo = this.aiService.getProviderInfo();

    res.status(200).json({
      success: true,
      message: 'Provider information retrieved',
      data: providerInfo
    });
  });
}
