export interface ReviewAIInsights {
  summary: string;
  pros: string[];
  cons: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ReviewAIService {
  summarizeReviews(bookId: string): Promise<ReviewAIInsights>;
  extractProsCons(bookId: string): Promise<{ pros: string[]; cons: string[] }>;
  sentimentAnalysis(bookId: string): Promise<'positive' | 'neutral' | 'negative'>;
}
