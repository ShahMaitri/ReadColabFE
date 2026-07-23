import { AIProvider, AIMessage } from '../interface/ai.interface';
import { PROMPTS, SYSTEM_PROMPTS } from '../templates/prompts';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract isConfigured: boolean;

  protected formatPrompt(template: string, variables: Record<string, string>): string {
    let formatted = template;
    Object.entries(variables).forEach(([key, value]) => {
      formatted = formatted.replace(`{${key}}`, value);
    });
    return formatted;
  }

  protected buildMessages(userPrompt: string, systemPrompt?: string): AIMessage[] {
    const messages: AIMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'assistant',
        content: systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: userPrompt
    });

    return messages;
  }

  abstract chat(messages: AIMessage[]): Promise<string>;

  async recommendBooks(userPreferences: string): Promise<string> {
    const prompt = this.formatPrompt(PROMPTS.BOOK_RECOMMENDATION, {
      preferences: userPreferences
    });

    return this.chat(this.buildMessages(prompt, SYSTEM_PROMPTS.RECOMMENDER));
  }

  async summarizeBook(bookTitle: string, bookContent: string): Promise<string> {
    const prompt = this.formatPrompt(PROMPTS.BOOK_SUMMARY, {
      title: bookTitle,
      content: bookContent
    });

    return this.chat(this.buildMessages(prompt, SYSTEM_PROMPTS.ANALYZER));
  }

  async compareBooks(book1: string, book2: string): Promise<string> {
    const prompt = this.formatPrompt(PROMPTS.BOOK_COMPARISON, {
      book1,
      book2
    });

    return this.chat(this.buildMessages(prompt, SYSTEM_PROMPTS.ANALYZER));
  }

  async semanticSearch(query: string, context: string[]): Promise<string> {
    const contextStr = context.join('\n');
    const prompt = this.formatPrompt(PROMPTS.SEMANTIC_SEARCH, {
      query,
      context: contextStr
    });

    return this.chat(this.buildMessages(prompt, SYSTEM_PROMPTS.SEARCHER));
  }

  async generateReadingPlan(genres: string[], duration: string): Promise<string> {
    const genresStr = genres.join(', ');
    const prompt = this.formatPrompt(PROMPTS.READING_PLAN, {
      genres: genresStr,
      duration
    });

    return this.chat(this.buildMessages(prompt, SYSTEM_PROMPTS.LIBRARIAN));
  }
}
