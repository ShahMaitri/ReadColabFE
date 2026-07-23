# AI Architecture - Smart Office Library

## Overview

The AI Service architecture provides a pluggable, provider-agnostic interface for AI-powered features in the Smart Office Library. It supports multiple AI providers with a unified API and dependency injection pattern.

## Architecture Principles

✅ **Provider Agnostic**: Switch between AI providers without code changes
✅ **Dependency Injection**: AIService injected via AIConfig singleton
✅ **Separation of Concerns**: AI logic isolated from controllers
✅ **No Direct API Calls**: All AI operations through AIService interface
✅ **Extensible**: Easy to add new providers

## Supported Providers

| Provider | Status | Configuration |
|----------|--------|---|
| **GitHub Models** | ✅ Configured | `AI_PROVIDER=github` + `GITHUB_MODELS_API_KEY` |
| **OpenAI** | 🔄 Stub Ready | `AI_PROVIDER=openai` + `OPENAI_API_KEY` |
| **Google Gemini** | 🔄 Stub Ready | `AI_PROVIDER=gemini` + `GEMINI_API_KEY` |
| **Anthropic Claude** | 🔄 Stub Ready | `AI_PROVIDER=claude` + `CLAUDE_API_KEY` |
| **Ollama (Local)** | 🔄 Stub Ready | `AI_PROVIDER=ollama` + `OLLAMA_BASE_URL` |

## Directory Structure

```
backend/src/ai/
├── interface/
│   └── ai.interface.ts          # Core interfaces (AIProvider, AIService)
├── providers/
│   ├── base.provider.ts         # BaseAIProvider abstract class
│   ├── github.provider.ts       # GitHub Models implementation
│   ├── openai.provider.ts       # OpenAI provider stub
│   ├── gemini.provider.ts       # Gemini provider stub
│   ├── claude.provider.ts       # Claude provider stub
│   └── ollama.provider.ts       # Ollama provider stub
├── templates/
│   └── prompts.ts               # Prompt templates and system prompts
├── service.ts                   # AIService orchestrator
├── controller.ts                # HTTP request handlers
├── routes.ts                    # Express routes with DI
├── index.ts                     # Public API exports
└── README.md                    # This file

backend/src/config/
└── ai.config.ts                 # AIConfig singleton with DI setup

frontend/src/hooks/
└── useAI.ts                     # React hooks for AI endpoints
```

## Core Interfaces

### AIProvider

```typescript
interface AIProvider {
  name: string;
  isConfigured: boolean;

  chat(messages: AIMessage[]): Promise<string>;
  recommendBooks(userPreferences: string): Promise<string>;
  summarizeBook(bookTitle: string, bookContent: string): Promise<string>;
  compareBooks(book1: string, book2: string): Promise<string>;
  semanticSearch(query: string, context: string[]): Promise<string>;
  generateReadingPlan(genres: string[], duration: string): Promise<string>;
}
```

### AIService

```typescript
interface AIServiceInterface {
  setProvider(provider: AIProvider): void;
  getProvider(): AIProvider;
  chat(messages: AIMessage[]): Promise<string>;
  recommendBooks(userPreferences: string): Promise<string>;
  summarizeBook(bookTitle: string, bookContent: string): Promise<string>;
  compareBooks(book1: string, book2: string): Promise<string>;
  semanticSearch(query: string, context: string[]): Promise<string>;
  generateReadingPlan(genres: string[], duration: string): Promise<string>;
}
```

## AI Methods

### 1. `chat(messages: AIMessage[])`
General-purpose chat with the AI assistant.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What's a good fantasy book?" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I recommend 'The Name of the Wind' by Patrick Rothfuss...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 2. `recommendBooks(preferences: string)`
Generate personalized book recommendations.

**Request:**
```json
{
  "preferences": "I love sci-fi and mystery novels, prefer recent publications"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": "[\n  { \"title\": \"Project Hail Mary\", \"author\": \"Andy Weir\", \"score\": 95 },\n  { \"title\": \"The Thursday Murder Club\", \"author\": \"Richard Osman\", \"score\": 92 }\n]",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 3. `summarizeBook(title: string, content: string)`
Generate a concise summary of a book.

**Request:**
```json
{
  "title": "1984",
  "content": "A dystopian novel by George Orwell... [full book content]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "1984",
    "summary": "In this dystopian masterpiece...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 4. `compareBooks(book1: string, book2: string)`
Compare two books on themes, style, and impact.

**Request:**
```json
{
  "book1": "The Great Gatsby by F. Scott Fitzgerald",
  "book2": "The Beautiful and Damned by F. Scott Fitzgerald"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "book1": "The Great Gatsby by F. Scott Fitzgerald",
    "book2": "The Beautiful and Damned by F. Scott Fitzgerald",
    "comparison": "While both novels explore the American Dream...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 5. `semanticSearch(query: string, context: string[])`
Find semantically similar books based on a query.

**Request:**
```json
{
  "query": "mysterious detective solving crimes in Victorian London",
  "context": [
    "Sherlock Holmes - Victorian detective",
    "The Name of the Wind - Fantasy adventure",
    "Agatha Christie mysteries"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "mysterious detective solving crimes in Victorian London",
    "results": "[\n  { \"title\": \"Sherlock Holmes\", \"relevance\": 95 },\n  { \"title\": \"Agatha Christie mysteries\", \"relevance\": 88 }\n]",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 6. `generateReadingPlan(genres: string[], duration: string)`
Create a personalized reading plan.

**Request:**
```json
{
  "genres": ["sci-fi", "mystery", "fantasy"],
  "duration": "3 months"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "genres": ["sci-fi", "mystery", "fantasy"],
    "duration": "3 months",
    "readingPlan": "Month 1: Start with sci-fi classics...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

## API Endpoints

All endpoints require authentication (Bearer token).

```
POST   /api/v1/ai/chat               - Chat with AI assistant
POST   /api/v1/ai/recommendations    - Get book recommendations
POST   /api/v1/ai/summarize          - Summarize a book
POST   /api/v1/ai/compare            - Compare two books
POST   /api/v1/ai/search             - Semantic search
POST   /api/v1/ai/reading-plan       - Generate reading plan
GET    /api/v1/ai/provider           - Get current provider info
```

## Setup & Configuration

### 1. Default Configuration (GitHub Models Mock)

```bash
# backend/.env
AI_PROVIDER=github
# Leave GITHUB_MODELS_API_KEY empty for mock responses
```

### 2. OpenAI Configuration

```bash
# backend/.env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your-api-key...
OPENAI_MODEL=gpt-4
```

### 3. Google Gemini Configuration

```bash
# backend/.env
AI_PROVIDER=gemini
GEMINI_API_KEY=...your-api-key...
GEMINI_MODEL=gemini-pro
```

### 4. Anthropic Claude Configuration

```bash
# backend/.env
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...your-api-key...
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### 5. Local Ollama Configuration

```bash
# backend/.env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Make sure Ollama is running:
# ollama serve
```

## Dependency Injection Pattern

### Backend (Service Layer)

```typescript
// In routes/v1.ts
import { AIConfig } from '../config/ai.config';
import { createAIRoutes } from '../ai/routes';

// Initialize AI service once at application startup
const aiService = AIConfig.initializeAIService();

// Inject into routes
v1Router.use('/ai', createAIRoutes(aiService));
```

### Runtime Provider Switching

```typescript
import { AIConfig } from './config/ai.config';

// Switch to a different provider at runtime
AIConfig.switchProvider('openai');

// Get current provider info
const info = AIConfig.getCurrentProviderInfo();
console.log(info); // { name: 'OpenAI', isConfigured: true }
```

## Frontend Usage

### React Hooks

```typescript
import {
  useAIChat,
  useBookRecommendations,
  useBookSummary,
  useBookComparison,
  useSemanticSearch,
  useReadingPlan,
  useAIProvider
} from '../hooks/useAI';

function RecommendationComponent() {
  const recommendationsMutation = useBookRecommendations();
  
  const handleGetRecommendations = async () => {
    try {
      const result = await recommendationsMutation.mutateAsync({
        preferences: 'I love sci-fi and mystery novels'
      });
      console.log('Recommendations:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleGetRecommendations} disabled={recommendationsMutation.isPending}>
      {recommendationsMutation.isPending ? 'Loading...' : 'Get Recommendations'}
    </button>
  );
}
```

## Adding a New Provider

1. Create a new provider file:

```typescript
// backend/src/ai/providers/yourprovider.provider.ts
import { BaseAIProvider } from './base.provider';
import { AIMessage } from '../interface/ai.interface';

export class YourProviderClass extends BaseAIProvider {
  name = 'Your Provider Name';
  isConfigured: boolean;
  
  async chat(messages: AIMessage[]): Promise<string> {
    // Implement your API call here
  }
}
```

2. Update `AIConfig.getProvider()`:

```typescript
case 'yourprovider':
  return new YourProviderClass(token);
```

3. Add environment variables to `.env.example`:

```bash
YOURPROVIDER_API_KEY=...
YOURPROVIDER_MODEL=...
```

## Error Handling

All AI service errors are caught and properly formatted:

```json
{
  "success": false,
  "message": "Chat error",
  "error": "API rate limit exceeded"
}
```

## Logging

The AIService logs all operations:

```
[AIService] AI Service initialized with provider: GitHub Models
[AIService] [GitHub Models] Processing chat request with 1 messages
[AIService] [GitHub Models] Chat response received
[AIService] Switched AI provider to: OpenAI
```

## Security Considerations

⚠️ **Important:**
- Never commit `.env` files with real API keys
- API keys are read from environment variables only
- All AI endpoints require authentication
- Rate limiting should be configured per provider
- Sensitive data should not be logged

## Testing

### Mock Responses

For development without API keys, the GitHub Models provider returns mock responses:

```typescript
const response = await aiService.recommendBooks('sci-fi');
// Returns mock recommendations
```

### Unit Testing

```typescript
import { GitHubModelsProvider } from '../ai/providers/github.provider';
import { AIService } from '../ai/service';

test('AI Service recommends books', async () => {
  const provider = new GitHubModelsProvider();
  const service = new AIService(provider);
  
  const response = await service.recommendBooks('sci-fi');
  expect(response).toBeDefined();
});
```

## Performance Optimization

- AI responses are not cached (real-time generation)
- For frequently accessed data, cache at the application level
- Consider rate limiting per user/IP
- Monitor API usage and costs for paid providers

## Future Enhancements

- [ ] Response caching for identical queries
- [ ] Streaming responses for long-form content
- [ ] Custom prompt templates per user
- [ ] Fine-tuned models per library use case
- [ ] Batch processing for bulk recommendations
- [ ] Vector embeddings for semantic search
- [ ] Multi-turn conversation memory
- [ ] Rate limiting and quota management

## Troubleshooting

### "AI Service not initialized"
Ensure `AIConfig.initializeAIService()` is called before using AI routes.

### "Provider is not configured"
Set the appropriate API key in `.env`:
```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
CLAUDE_API_KEY=sk-ant-...
```

### Mock responses being returned
This is expected behavior when API keys are not configured. Set the appropriate API key to use real AI responses.

### Rate limit errors
Check your provider's usage dashboard and consider upgrading your plan.

## Support

For issues or questions about the AI architecture:
1. Check the logs: `[AIService]` prefix in console output
2. Verify provider configuration in `.env`
3. Test the `/ai/provider` endpoint to check status
4. Review provider documentation

---

**Architecture Designed For:** Scalability, Maintainability, Extensibility
**Principle:** Everything flows through AIService ✅
