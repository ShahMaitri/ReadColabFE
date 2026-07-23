import { Router } from 'express';
import { AIController } from './controller';
import { AIService } from './service';
import { authenticate } from '../middleware/authenticate';

export function createAIRoutes(aiService: AIService): Router {
  const aiRouter = Router();
  const aiController = new AIController(aiService);

  // All AI endpoints require authentication
  aiRouter.use(authenticate);

  // Chat endpoint
  aiRouter.post('/chat', aiController.chat);

  // Book recommendations
  aiRouter.post('/recommendations', aiController.recommendBooks);

  // Book summarization
  aiRouter.post('/summarize', aiController.summarizeBook);

  // Book comparison
  aiRouter.post('/compare', aiController.compareBooks);

  // Semantic search
  aiRouter.post('/search', aiController.semanticSearch);

  // Reading plan generation
  aiRouter.post('/reading-plan', aiController.generateReadingPlan);

  // Get current provider info
  aiRouter.get('/provider', aiController.getProvider);

  return aiRouter;
}
