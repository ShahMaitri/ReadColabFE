# AI Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ React Components                                            │   │
│  │  • RecommendationComponent                                 │   │
│  │  • ChatComponent                                           │   │
│  │  • ReadingPlanComponent                                    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│                             │                                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Custom Hooks (useAI.ts)                                    │   │
│  │  • useAIChat()                                             │   │
│  │  • useBookRecommendations()                                │   │
│  │  • useBookSummary()                                        │   │
│  │  • useBookComparison()                                     │   │
│  │  • useSemanticSearch()                                     │   │
│  │  • useReadingPlan()                                        │   │
│  │  • useAIProvider()                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│                             │ TanStack Query                        │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              │ HTTP (Bearer Token)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Express Routes (routes.ts)                                 │   │
│  │  POST   /api/v1/ai/chat                                    │   │
│  │  POST   /api/v1/ai/recommendations                         │   │
│  │  POST   /api/v1/ai/summarize                               │   │
│  │  POST   /api/v1/ai/compare                                 │   │
│  │  POST   /api/v1/ai/search                                  │   │
│  │  POST   /api/v1/ai/reading-plan                            │   │
│  │  GET    /api/v1/ai/provider                                │   │
│  └────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│          ┌──────────────────┴──────────────────┐                   │
│          │  authenticate middleware            │                   │
│          └──────────────────┬──────────────────┘                   │
│                             │                                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ AIController (controller.ts)                               │   │
│  │  • chat()           ← POST /ai/chat                         │   │
│  │  • recommendBooks() ← POST /ai/recommendations             │   │
│  │  • summarizeBook()  ← POST /ai/summarize                   │   │
│  │  • compareBooks()   ← POST /ai/compare                     │   │
│  │  • semanticSearch() ← POST /ai/search                      │   │
│  │  • generateReadingPlan() ← POST /ai/reading-plan           │   │
│  │  • getProvider()    ← GET /ai/provider                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│                             │ Dependency Injection                  │
│                             │ (aiService injected)                  │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ AIService (service.ts)                                     │   │
│  │  • setProvider(provider)                                   │   │
│  │  • getProvider()                                           │   │
│  │  • chat(messages)                                          │   │
│  │  • recommendBooks(preferences)                             │   │
│  │  • summarizeBook(title, content)                           │   │
│  │  • compareBooks(book1, book2)                              │   │
│  │  • semanticSearch(query, context)                          │   │
│  │  • generateReadingPlan(genres, duration)                   │   │
│  │  • getProviderInfo()                                       │   │
│  │  [Logging, Error Handling]                                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│                             │                                       │
│  ┌──────────┬──────────┬────┴────┬──────────┬─────────────┐       │
│  │          │          │         │          │             │       │
│  ▼          ▼          ▼         ▼          ▼             ▼       │
│┌──────────┐┌───────────────────┐ ┌────────────────┐ ┌──────────┐ │
││ GitHub   ││    OpenAI         │ │  Gemini        │ │ Claude   │ │
││ Models   ││    (Stub Ready)    │ │  (Stub Ready)  │ │(Stub)    │ │
│└──────────┘└───────────────────┘ └────────────────┘ └──────────┘ │
│      ▲                                                   │         │
│      └─────────────────────────────────────────────────┘         │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ BaseAIProvider (base.provider.ts)                          │   │
│  │  Abstract methods:                                         │   │
│  │  • chat(messages)                                          │   │
│  │  • recommendBooks(preferences)                             │   │
│  │  • summarizeBook(title, content)                           │   │
│  │  • compareBooks(book1, book2)                              │   │
│  │  • semanticSearch(query, context)                          │   │
│  │  • generateReadingPlan(genres, duration)                   │   │
│  │                                                            │   │
│  │  Helper methods:                                           │   │
│  │  • formatPrompt(template, variables)                       │   │
│  │  • buildMessages(userPrompt, systemPrompt)                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                             ▲                                       │
│                             │                                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ AIProvider Interface (interface/ai.interface.ts)           │   │
│  │ Defines contract for all providers                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ AIConfig (config/ai.config.ts)                             │   │
│  │  • initializeAIService() ← Singleton initialization       │   │
│  │  • getAIService()       ← Get instance                    │   │
│  │  • switchProvider()     ← Runtime switching              │   │
│  │  • getProvider()        ← Select provider by env var      │   │
│  │  [Dependency Injection Container]                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Optional
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
            ┌──────────────────┐  ┌──────────────┐
            │  OLLAMA (Local)  │  │ Paid API     │
            │  (Stub Ready)    │  │ (Any Provider)│
            └──────────────────┘  └──────────────┘
                    HTTP                HTTPS
                  Port 11434           HTTPS API
```

## Data Flow: Recommendation Request

```
┌─────────────────────────────────────────────────────────────────┐
│ USER (Frontend)                                                  │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ User clicks: "Get Recommendations"                      │    │
│ │ Preferences: "sci-fi and mystery"                       │    │
│ └────────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│ ┌────────────────────▼────────────────────────────────────┐    │
│ │ useBookRecommendations().mutateAsync(...)               │    │
│ │ (React Hook)                                            │    │
│ └────────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│ ┌────────────────────▼────────────────────────────────────┐    │
│ │ POST /api/v1/ai/recommendations                         │    │
│ │ Body: { preferences: "sci-fi and mystery" }             │    │
│ │ Header: Authorization: Bearer token                     │    │
│ └────────────────────┬────────────────────────────────────┘    │
└─────────────────────┼────────────────────────────────────────────┘
                      │ (HTTP Request)
┌─────────────────────▼────────────────────────────────────────────┐
│ BACKEND (Express Server)                                          │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ authenticate middleware                                 │    │
│ │ → Verify Bearer token                                   │    │
│ │ → Attach user to req.user                               │    │
│ └────────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│ ┌────────────────────▼────────────────────────────────────┐    │
│ │ AIController.recommendBooks()                            │    │
│ │ → Validate request body                                 │    │
│ │ → Call aiService.recommendBooks(preferences)             │    │
│ └────────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│ ┌────────────────────▼────────────────────────────────────┐    │
│ │ AIService.recommendBooks(preferences)                    │    │
│ │ → Log: "[AIService] Generating recommendations..."      │    │
│ │ → Call provider.recommendBooks(preferences)              │    │
│ │ → Log: "[AIService] Recommendations generated"          │    │
│ │ → Return result                                         │    │
│ └────────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│ ┌────────────────────▼────────────────────────────────────┐    │
│ │ AIProvider.recommendBooks(preferences)                   │    │
│ │ (e.g., GitHubModelsProvider)                            │    │
│ │                                                         │    │
│ │ → Format prompt using PROMPTS.BOOK_RECOMMENDATION      │    │
│ │ → Build messages with system prompt                     │    │
│ │ → Call this.chat(messages)                              │    │
│ │ → [Mock response or API call]                            │    │
│ │ → Return AI response                                    │    │
│ └────────────────────┬────────────────────────────────────┘    │
│                      │                                           │
│ ┌────────────────────▼────────────────────────────────────┐    │
│ │ AIController formats response                            │    │
│ │ {                                                        │    │
│ │   success: true,                                        │    │
│ │   message: "Book recommendations generated",             │    │
│ │   data: {                                               │    │
│ │     recommendations: "...",                              │    │
│ │     provider: { name: "GitHub Models", ... }            │    │
│ │   }                                                     │    │
│ │ }                                                        │    │
│ └────────────────────┬────────────────────────────────────┘    │
└─────────────────────┼────────────────────────────────────────────┘
                      │ (HTTP Response)
┌─────────────────────▼────────────────────────────────────────────┐
│ USER (Frontend Receives Response)                                │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Response Status: 200 OK                                 │   │
│ │ Data: Recommendations JSON                              │   │
│ │                                                         │   │
│ │ → Update component state                               │   │
│ │ → Display recommendations to user                       │   │
│ │ → Show provider info: "Powered by GitHub Models"        │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Provider Selection Logic

```
┌──────────────────────────────────┐
│ Read AI_PROVIDER from .env       │
└────────┬─────────────────────────┘
         │
         ▼
    ┌────────────────────┐
    │ AI_PROVIDER value? │
    └────┬──────┬──────┬─────┬──────┐
         │      │      │     │      │
    "github" "openai" "gemini" "claude" "ollama"
         │      │      │     │      │
         ▼      ▼      ▼     ▼      ▼
       ┌──────────────────────────────────────┐
       │ AIConfig.getProvider()               │
       │ Returns configured provider instance │
       └────────────────┬─────────────────────┘
                        │
                        ▼
       ┌──────────────────────────────────────┐
       │ AIService initialized with provider  │
       │ Ready for requests                   │
       └──────────────────────────────────────┘
```

## Class Hierarchy

```
AIProvider (Interface)
    │
    ├─→ BaseAIProvider (Abstract Class)
    │        │
    │        ├─→ GitHubModelsProvider
    │        ├─→ OpenAIProvider
    │        ├─→ GeminiProvider
    │        ├─→ ClaudeProvider
    │        └─→ OllamaProvider
    │
    └─→ All providers implement:
         • chat()
         • recommendBooks()
         • summarizeBook()
         • compareBooks()
         • semanticSearch()
         • generateReadingPlan()
```

## Dependency Injection Flow

```
┌────────────────────────────────────────────────────────────┐
│ Application Startup (server.ts)                            │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│ routes/v1.ts imports AIConfig                              │
│                                                            │
│ const aiService = AIConfig.initializeAIService()           │
│   → Reads AI_PROVIDER from env                             │
│   → Creates appropriate provider instance                  │
│   → Wraps in AIService                                     │
│   → Returns singleton instance                            │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│ Routes registration                                        │
│                                                            │
│ v1Router.use('/ai', createAIRoutes(aiService))             │
│   → Passes aiService to route factory                     │
│   → AIController receives aiService in constructor         │
│   → All route handlers have access to service              │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│ Request arrives                                            │
│                                                            │
│ POST /api/v1/ai/chat { messages: [...] }                   │
│   → Matches route                                         │
│   → Calls aiController.chat()                              │
│   → Controller calls aiService.chat()                      │
│   → Service calls provider.chat()                          │
│   → Response returned                                     │
└────────────────────────────────────────────────────────────┘
```

## Provider Switching at Runtime

```
Initial State:
┌──────────────────┐
│ GitHubModels     │  ← Current active provider
│ (Default)        │
└──────────────────┘

User/Admin Action:
┌──────────────────────────────────────┐
│ AIConfig.switchProvider('openai')    │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ AIConfig validates environment:                          │
│  • Check OPENAI_API_KEY exists                           │
│  • Check OPENAI_MODEL configured                         │
│  • Create new OpenAIProvider(token, model)               │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ AIService.setProvider(newProvider)                       │
│  • Replace internal provider reference                   │
│  • Log: "[AIService] Switched AI provider to: OpenAI"   │
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
New State:
┌──────────────────┐
│ OpenAI           │  ← New active provider
│ (User selected)  │
└──────────────────┘

Next request:
┌──────────────────────────────────────────────────────────┐
│ POST /api/v1/ai/chat                                     │
│  → Uses OpenAI provider                                  │
│  → [OpenAI] API call made                                │
│  → Response from OpenAI returned                         │
└──────────────────────────────────────────────────────────┘
```

---

**Key Points:**
✅ Separation of concerns at each layer
✅ Single responsibility for each component
✅ Dependency injection enables testing & flexibility
✅ Provider abstraction enables provider swapping
✅ Clear data flow from frontend through backend
✅ Extensible architecture for new methods/providers
