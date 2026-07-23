import { BaseAIProvider } from './base.provider';
import { AIMessage } from '../interface/ai.interface';

export class GeminiProvider extends BaseAIProvider {
  name = 'Google Gemini';
  isConfigured: boolean;
  private token: string | undefined;
  private model: string = 'gemini-pro';

  constructor(token?: string, model?: string) {
    super();
    this.token = token;
    this.model = model || 'gemini-pro';
    this.isConfigured = !!token;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Gemini provider is not configured. Please set API_KEY');
    }

    try {
      // TODO: Implement actual Google Gemini API integration
      // Example structure:
      // const response = await fetch(
      //   `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.token}`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       contents: messages.map(msg => ({
      //         role: msg.role === 'user' ? 'user' : 'model',
      //         parts: [{ text: msg.content }]
      //       })),
      //     }),
      //   }
      // );
      // return response.json();

      throw new Error('Gemini provider not yet implemented');
    } catch (error) {
      throw new Error(`Gemini API error: ${error}`);
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
