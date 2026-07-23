export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface AIProvider {
  name: string;
  isConfigured: boolean;

  chat(messages: AIMessage[]): Promise<string>;
  recommendBooks(userPreferences: string): Promise<string>;
  summarizeBook(bookTitle: string, bookContent: string): Promise<string>;
  compareBooks(book1: string, book2: string): Promise<string>;
  semanticSearch(query: string, context: string[]): Promise<string>;
  generateReadingPlan(genres: string[], duration: string): Promise<string>;
}

export interface AIServiceInterface {
  setProvider(provider: AIProvider): void;
  getProvider(): AIProvider;
  chat(messages: AIMessage[]): Promise<string>;
  recommendBooks(userPreferences: string): Promise<string>;
  summarizeBook(bookTitle: string, bookContent: string): Promise<string>;
  compareBooks(book1: string, book2: string): Promise<string>;
  semanticSearch(query: string, context: string[]): Promise<string>;
  generateReadingPlan(genres: string[], duration: string): Promise<string>;
}
