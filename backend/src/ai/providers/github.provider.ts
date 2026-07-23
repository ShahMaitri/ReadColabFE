import { BaseAIProvider } from './base.provider';
import { AIMessage } from '../interface/ai.interface';

export class GitHubModelsProvider extends BaseAIProvider {
  name = 'GitHub Models';
  isConfigured: boolean;
  private token: string | undefined;
  private model: string = 'gpt-4'; // Default model

  constructor(token?: string, model?: string) {
    super();
    this.token = token;
    this.model = model || 'gpt-4';
    this.isConfigured = !!token;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.isConfigured) {
      return this.getMockResponse('chat', messages);
    }

    try {
      // NOTE: This is a stub implementation
      // Actual GitHub Models API calls would be made here
      // For now, return a mock response to demonstrate the architecture
      return this.getMockResponse('chat', messages);
    } catch (error) {
      throw new Error(`GitHub Models API error: ${error}`);
    }
  }

  private getMockResponse(type: string, data: any): string {
    // Mock responses for demonstration
    const mockResponses: Record<string, string> = {
      chat: 'This is a mock response from GitHub Models provider. Configure a real API token to enable actual AI responses.',
      recommendation: JSON.stringify({
        recommendations: [
          { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', score: 95 },
          { title: '1984', author: 'George Orwell', score: 92 },
          { title: 'To Kill a Mockingbird', author: 'Harper Lee', score: 90 }
        ]
      }),
      search: JSON.stringify({
        results: [
          { title: 'The Great Gatsby', relevance: 95 },
          { title: 'The Beautiful and Damned', relevance: 88 }
        ]
      })
    };

    return mockResponses[type] || 'Mock AI Response';
  }

  /**
   * Set or update the GitHub Models API token
   */
  setToken(token: string): void {
    this.token = token;
    this.isConfigured = !!token;
  }

  /**
   * Set the model to use (e.g., 'gpt-4', 'gpt-3.5-turbo')
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current configuration status
   */
  getConfig(): { isConfigured: boolean; model: string } {
    return {
      isConfigured: this.isConfigured,
      model: this.model
    };
  }
}
