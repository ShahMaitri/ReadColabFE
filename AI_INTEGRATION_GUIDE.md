# AI Architecture - Quick Integration Guide

## 🚀 Getting Started

### 1. Backend API Usage

All AI endpoints require authentication. Send requests with a Bearer token:

```bash
curl -X POST http://localhost:5000/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Recommend sci-fi books" }
    ]
  }'
```

### 2. Frontend Usage (React)

```typescript
import { useBookRecommendations, useAIProvider } from '@/hooks/useAI';

function BookRecommender() {
  const { data: provider } = useAIProvider();
  const recommendationsMutation = useBookRecommendations();

  const handleGetRecommendations = async () => {
    try {
      const recommendations = await recommendationsMutation.mutateAsync({
        preferences: 'I enjoy sci-fi and mystery novels'
      });
      console.log('Recommendations:', recommendations);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <p>Using provider: {provider?.name}</p>
      <button 
        onClick={handleGetRecommendations}
        disabled={recommendationsMutation.isPending}
      >
        Get Recommendations
      </button>
    </div>
  );
}
```

## 🔄 Switching Providers

### At Application Startup

The provider is set based on `AI_PROVIDER` environment variable:

```bash
# .env
AI_PROVIDER=github  # Default (works without API key)
# or
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### At Runtime

```typescript
import { AIConfig } from '@/config/ai.config';

// Switch provider
AIConfig.switchProvider('openai');

// Get current provider
const info = AIConfig.getCurrentProviderInfo();
console.log(info.name); // 'OpenAI'
```

## 📋 All 6 AI Methods

### 1. Chat
**General conversation with the AI assistant**

```typescript
const chatMutation = useAIChat();

const response = await chatMutation.mutateAsync({
  messages: [
    { role: 'user', content: 'What makes a good book?' }
  ]
});
```

### 2. Recommend Books
**Get personalized book recommendations**

```typescript
const recMutation = useBookRecommendations();

const recommendations = await recMutation.mutateAsync({
  preferences: 'I love sci-fi with mystery elements, prefer recent authors'
});
```

### 3. Summarize Book
**Generate a summary of a book**

```typescript
const summaryMutation = useBookSummary();

const summary = await summaryMutation.mutateAsync({
  title: '1984',
  content: 'In the year 1984...' // full book text
});
```

### 4. Compare Books
**Compare two books by themes, style, impact**

```typescript
const compareMutation = useBookComparison();

const comparison = await compareMutation.mutateAsync({
  book1: 'The Great Gatsby by F. Scott Fitzgerald',
  book2: 'The Beautiful and Damned by F. Scott Fitzgerald'
});
```

### 5. Semantic Search
**Find relevant books based on semantic meaning**

```typescript
const searchMutation = useSemanticSearch();

const results = await searchMutation.mutateAsync({
  query: 'mysterious detective in Victorian London',
  context: [
    'Sherlock Holmes Series',
    'The Name of the Wind',
    'Agatha Christie Mysteries'
  ]
});
```

### 6. Reading Plan
**Generate personalized reading plan**

```typescript
const planMutation = useReadingPlan();

const plan = await planMutation.mutateAsync({
  genres: ['sci-fi', 'mystery', 'fantasy'],
  duration: '3 months'
});
```

## 🔧 Backend Usage (Direct Service)

If you need to use AI service directly in backend code:

```typescript
import { AIConfig } from './config/ai.config';

// Get the service
const aiService = AIConfig.getAIService();

// Use it
const response = await aiService.chat([
  { role: 'user', content: 'Hello!' }
]);

// Or use specific methods
const recommendations = await aiService.recommendBooks('sci-fi');
```

## 🛠️ Creating a New AI Feature

### 1. Add Method to AIProvider Interface

```typescript
// ai/interface/ai.interface.ts
export interface AIProvider {
  // ... existing methods
  generateSynopsis(genre: string, theme: string): Promise<string>;
}
```

### 2. Implement in BaseAIProvider

```typescript
// ai/providers/base.provider.ts
export abstract class BaseAIProvider implements AIProvider {
  async generateSynopsis(genre: string, theme: string): Promise<string> {
    const prompt = this.formatPrompt(PROMPTS.GENERATE_SYNOPSIS, {
      genre,
      theme
    });
    return this.chat(this.buildMessages(prompt));
  }
}
```

### 3. Add to AIService

```typescript
// ai/service.ts
export class AIService implements AIServiceInterface {
  async generateSynopsis(genre: string, theme: string): Promise<string> {
    return await this.provider.generateSynopsis(genre, theme);
  }
}
```

### 4. Add Controller Method

```typescript
// ai/controller.ts
generateSynopsis = asyncHandler(async (req: Request, res: Response) => {
  const { genre, theme } = req.body;
  const synopsis = await this.aiService.generateSynopsis(genre, theme);
  res.status(200).json({ success: true, data: { synopsis } });
});
```

### 5. Add Route

```typescript
// ai/routes.ts
aiRouter.post('/synopsis', aiController.generateSynopsis);
```

## 🧪 Testing the API

### Using Postman/Insomnia

1. Get an authentication token from login
2. Create new POST request to `http://localhost:5000/api/v1/ai/chat`
3. Add header: `Authorization: Bearer YOUR_TOKEN`
4. Send JSON body:
```json
{
  "messages": [
    { "role": "user", "content": "What's a good book?" }
  ]
}
```

### Using cURL

```bash
# Get token first
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# Use token for AI request
curl -X POST http://localhost:5000/api/v1/ai/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferences":"sci-fi and fantasy books"}'
```

## 📊 Monitoring & Logging

All AI service operations are logged:

```
[AIService] AI Service initialized with provider: GitHub Models
[AIService] [GitHub Models] Processing chat request with 1 messages
[AIService] [GitHub Models] Chat response received
```

Check logs to:
- Monitor provider usage
- Debug API failures
- Track performance
- Verify authentication

## ⚠️ Important Notes

1. **No API Keys in Code** - Always use environment variables
2. **Authentication Required** - All endpoints need Bearer token
3. **Mock Responses** - GitHub Models works without API key (perfect for testing)
4. **Error Handling** - All errors return `{ success: false, error: "..." }`
5. **Rate Limits** - Check your AI provider's rate limits

## 🚨 Common Issues

### "Provider is not configured"
Make sure you have the API key set in `.env`:
```bash
OPENAI_API_KEY=sk-...
```

### "No authorization token provided"
Add Authorization header to request:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Mock responses instead of real AI
This is normal if no API key is configured. Set the appropriate key:
```bash
GITHUB_MODELS_API_KEY=...  # or
OPENAI_API_KEY=sk-...
```

### Provider switch not working
Call `AIConfig.initializeAIService()` once at startup before switching:
```typescript
// In app.ts or server.ts
const aiService = AIConfig.initializeAIService();
// Now you can switch at runtime
AIConfig.switchProvider('openai');
```

## 📚 Documentation

Full documentation available at:
- `backend/src/ai/README.md` - Comprehensive guide (50+ KB)
- API Endpoints section shows all 7 endpoints with examples
- Provider configurations for each AI service
- Frontend hook examples
- Architecture diagrams

## 🎯 Next Steps

1. Start with GitHub Models (works out-of-the-box)
2. Test endpoints using Postman/cURL
3. Build UI components for your features
4. Configure a paid provider when ready
5. Implement custom prompt templates
6. Add caching for frequently asked queries

---

**Everything flows through AIService ✅**
