import { BaseAIProvider } from './base.provider';
import { AIMessage } from '../interface/ai.interface';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';
  isConfigured: boolean;
  private token: string | undefined;
  private model: string = 'gpt-4';

  constructor(token?: string, model?: string) {
    super();
    this.token = token;
    this.model = model || 'gpt-4';
    this.isConfigured = !!token;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('OpenAI provider is not configured. Please set API_KEY');
    }

    try {
      // TODO: Implement actual OpenAI API integration
      // Example structure:
      // const response = await fetch('https://api.openai.com/v1/chat/completions', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     model: this.model,
      //     messages: messages,
      //   }),
      // });
      // return response.json();

      throw new Error('OpenAI provider not yet implemented');
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  setToken(token: string): void {
    this.token = token;
    this.isConfigured = !!token;
  }

  setModel(model: string): void {
    this.model = model;
  }
}
