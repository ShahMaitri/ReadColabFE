import { AIServiceInterface, AIProvider, AIMessage } from './interface/ai.interface';
import { GitHubModelsProvider } from './providers/github.provider';

export class AIService implements AIServiceInterface {
  private provider: AIProvider;
  private logger: any;

  constructor(provider?: AIProvider, logger?: any) {
    // Default to GitHub Models provider if none provided
    this.provider = provider || new GitHubModelsProvider();
    this.logger = logger;
  }

  /**
   * Set a new AI provider at runtime
   */
  setProvider(provider: AIProvider): void {
    this.provider = provider;
    this.log(`Switched AI provider to: ${provider.name}`);
  }

  /**
   * Get the current active provider
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Send messages to the AI provider
   */
  async chat(messages: AIMessage[]): Promise<string> {
    try {
      this.log(`[${this.provider.name}] Processing chat request with ${messages.length} messages`);
      const response = await this.provider.chat(messages);
      this.log(`[${this.provider.name}] Chat response received`);
      return response;
    } catch (error) {
      this.logError(`Chat error: ${error}`);
      throw error;
    }
  }

  /**
   * Get personalized book recommendations
   */
  async recommendBooks(userPreferences: string): Promise<string> {
    try {
      this.log(`[${this.provider.name}] Generating book recommendations`);
      const response = await this.provider.recommendBooks(userPreferences);
      this.log(`[${this.provider.name}] Recommendations generated`);
      return response;
    } catch (error) {
      this.logError(`Recommendation error: ${error}`);
      throw error;
    }
  }

  /**
   * Summarize a book
   */
  async summarizeBook(bookTitle: string, bookContent: string): Promise<string> {
    try {
      this.log(`[${this.provider.name}] Summarizing book: ${bookTitle}`);
      const response = await this.provider.summarizeBook(bookTitle, bookContent);
      this.log(`[${this.provider.name}] Book summary generated`);
      return response;
    } catch (error) {
      this.logError(`Summary error: ${error}`);
      throw error;
    }
  }

  /**
   * Compare two books
   */
  async compareBooks(book1: string, book2: string): Promise<string> {
    try {
      this.log(`[${this.provider.name}] Comparing books: ${book1} vs ${book2}`);
      const response = await this.provider.compareBooks(book1, book2);
      this.log(`[${this.provider.name}] Book comparison generated`);
      return response;
    } catch (error) {
      this.logError(`Comparison error: ${error}`);
      throw error;
    }
  }

  /**
   * Perform semantic search across books
   */
  async semanticSearch(query: string, context: string[]): Promise<string> {
    try {
      this.log(`[${this.provider.name}] Performing semantic search: "${query}"`);
      const response = await this.provider.semanticSearch(query, context);
      this.log(`[${this.provider.name}] Semantic search completed`);
      return response;
    } catch (error) {
      this.logError(`Search error: ${error}`);
      throw error;
    }
  }

  /**
   * Generate a personalized reading plan
   */
  async generateReadingPlan(genres: string[], duration: string): Promise<string> {
    try {
      this.log(`[${this.provider.name}] Generating reading plan for genres: ${genres.join(', ')}`);
      const response = await this.provider.generateReadingPlan(genres, duration);
      this.log(`[${this.provider.name}] Reading plan generated`);
      return response;
    } catch (error) {
      this.logError(`Reading plan error: ${error}`);
      throw error;
    }
  }

  /**
   * Get current provider information
   */
  getProviderInfo(): { name: string; isConfigured: boolean } {
    return {
      name: this.provider.name,
      isConfigured: this.provider.isConfigured
    };
  }

  private log(message: string): void {
    if (this.logger?.info) {
      this.logger.info(`[AIService] ${message}`);
    } else {
      console.log(`[AIService] ${message}`);
    }
  }

  private logError(message: string): void {
    if (this.logger?.error) {
      this.logger.error(`[AIService] ${message}`);
    } else {
      console.error(`[AIService] ${message}`);
    }
  }
}
