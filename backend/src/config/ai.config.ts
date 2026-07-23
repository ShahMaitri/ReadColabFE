import { AIService } from '../ai/service';
import { AIProvider } from '../ai/interface/ai.interface';
import { GitHubModelsProvider } from '../ai/providers/github.provider';
import { OpenAIProvider } from '../ai/providers/openai.provider';
import { GeminiProvider } from '../ai/providers/gemini.provider';
import { ClaudeProvider } from '../ai/providers/claude.provider';
import { OllamaProvider } from '../ai/providers/ollama.provider';
import { logger } from './logger';

/**
 * AI Service Configuration
 * Handles dependency injection for the AI service
 */
export class AIConfig {
  private static instance: AIService;

  /**
   * Initialize AI Service with appropriate provider
   */
  static initializeAIService(): AIService {
    if (AIConfig.instance) {
      return AIConfig.instance;
    }

    // Determine which provider to use based on environment variables
    const provider = this.getProvider();
    AIConfig.instance = new AIService(provider, logger);

    logger.info(`AI Service initialized with provider: ${provider.name}`);

    return AIConfig.instance;
  }

  /**
   * Get AI Service instance
   */
  static getAIService(): AIService {
    if (!AIConfig.instance) {
      throw new Error('AI Service not initialized. Call initializeAIService first.');
    }
    return AIConfig.instance;
  }

  /**
   * Determine which provider to use
   */
  private static getProvider(): AIProvider {
    const preferredProvider = process.env.AI_PROVIDER?.toLowerCase() || 'github';

    switch (preferredProvider) {
      case 'openai':
        return this.createOpenAIProvider();
      case 'gemini':
        return this.createGeminiProvider();
      case 'claude':
        return this.createClaudeProvider();
      case 'ollama':
        return this.createOllamaProvider();
      case 'github':
      default:
        return this.createGitHubProvider();
    }
  }

  /**
   * Create GitHub Models Provider
   */
  private static createGitHubProvider(): AIProvider {
    const token = process.env.GITHUB_MODELS_API_KEY;
    const model = process.env.GITHUB_MODELS_MODEL || 'gpt-4';

    if (!token) {
      logger.warn('GITHUB_MODELS_API_KEY not set. Using mock responses.');
    }

    return new GitHubModelsProvider(token, model);
  }

  /**
   * Create OpenAI Provider
   */
  private static createOpenAIProvider(): AIProvider {
    const token = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4';

    if (!token) {
      logger.error('OPENAI_API_KEY not set. Cannot initialize OpenAI provider.');
      throw new Error('OpenAI API key is required but not configured.');
    }

    return new OpenAIProvider(token, model);
  }

  /**
   * Create Gemini Provider
   */
  private static createGeminiProvider(): AIProvider {
    const token = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-pro';

    if (!token) {
      logger.error('GEMINI_API_KEY not set. Cannot initialize Gemini provider.');
      throw new Error('Gemini API key is required but not configured.');
    }

    return new GeminiProvider(token, model);
  }

  /**
   * Create Claude Provider
   */
  private static createClaudeProvider(): AIProvider {
    const token = process.env.CLAUDE_API_KEY;
    const model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';

    if (!token) {
      logger.error('CLAUDE_API_KEY not set. Cannot initialize Claude provider.');
      throw new Error('Claude API key is required but not configured.');
    }

    return new ClaudeProvider(token, model);
  }

  /**
   * Create Ollama Provider
   */
  private static createOllamaProvider(): AIProvider {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama2';

    return new OllamaProvider(baseUrl, model);
  }

  /**
   * Switch AI provider at runtime
   */
  static switchProvider(providerName: string): void {
    const provider = (() => {
      switch (providerName.toLowerCase()) {
        case 'openai':
          return this.createOpenAIProvider();
        case 'gemini':
          return this.createGeminiProvider();
        case 'claude':
          return this.createClaudeProvider();
        case 'ollama':
          return this.createOllamaProvider();
        case 'github':
          return this.createGitHubProvider();
        default:
          throw new Error(`Unknown provider: ${providerName}`);
      }
    })();

    if (AIConfig.instance) {
      AIConfig.instance.setProvider(provider);
      logger.info(`AI Provider switched to: ${provider.name}`);
    }
  }

  /**
   * Get list of available providers
   */
  static getAvailableProviders(): string[] {
    return ['github', 'openai', 'gemini', 'claude', 'ollama'];
  }

  /**
   * Get current provider info
   */
  static getCurrentProviderInfo(): { name: string; isConfigured: boolean } {
    if (!AIConfig.instance) {
      throw new Error('AI Service not initialized');
    }
    return AIConfig.instance.getProviderInfo();
  }
}
