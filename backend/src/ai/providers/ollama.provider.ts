import { BaseAIProvider } from './base.provider';
import { AIMessage } from '../interface/ai.interface';

export class OllamaProvider extends BaseAIProvider {
  name = 'Ollama';
  isConfigured: boolean;
  private baseUrl: string = 'http://localhost:11434';
  private model: string = 'llama2';

  constructor(baseUrl?: string, model?: string) {
    super();
    this.baseUrl = baseUrl || 'http://localhost:11434';
    this.model = model || 'llama2';
    // Ollama is considered configured if we have a valid URL
    this.isConfigured = !!baseUrl;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    try {
      // TODO: Implement actual Ollama API integration
      // Example structure:
      // const response = await fetch(`${this.baseUrl}/api/chat`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     model: this.model,
      //     messages: messages,
      //     stream: false,
      //   }),
      // });
      // const data = await response.json();
      // return data.message.content;

      throw new Error('Ollama provider not yet implemented');
    } catch (error) {
      throw new Error(`Ollama API error: ${error}`);
    }
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.isConfigured = true;
  }

  setModel(model: string): void {
    this.model = model;
  }

  getConfig(): { baseUrl: string; model: string } {
    return {
      baseUrl: this.baseUrl,
      model: this.model
    };
  }
}
