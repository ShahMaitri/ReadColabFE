import { BaseAIProvider } from './base.provider';
import { AIMessage } from '../interface/ai.interface';

export class GitHubModelsProvider extends BaseAIProvider {
  name = 'GitHub Models';
  isConfigured: boolean;
  private token: string | undefined;
  private model: string = 'gpt-4'; // Default model
  private endpoint: string;

  constructor(token?: string, model?: string) {
    super();
    this.token = token;
    this.model = model || 'gpt-4';
    this.isConfigured = !!token;
    this.endpoint = process.env.GITHUB_MODELS_ENDPOINT || 'https://models.inference.ai.azure.com/chat/completions';
  }

  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.isConfigured) {
      return this.getMockResponse('chat', messages);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.content
          })),
          temperature: 0.7,
          top_p: 1,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        let details = '';
        try {
          const errorBody = await response.json() as { error?: { message?: string } };
          details = errorBody?.error?.message ? `: ${errorBody.error.message}` : '';
        } catch (_error) {
          // Ignore parsing errors and fallback to status text.
        }
        throw new Error(`GitHub Models request failed (${response.status} ${response.statusText})${details}`);
      }

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('GitHub Models returned an empty response');
      }

      return content;
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
