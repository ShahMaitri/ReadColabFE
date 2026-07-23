# AI Architecture - Testing Guide

## Setup for Testing

### 1. Ensure Backend is Running

```bash
cd backend
npm run dev
# Server should start on http://localhost:5000
```

### 2. Get Authentication Token

Login to get a bearer token (required for all AI endpoints):

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", "email": "user@example.com" }
  }
}
```

**Save the token** - you'll need it for all AI requests.

## Testing Each Endpoint

### 1. GET /api/v1/ai/provider

Check current AI provider configuration.

```bash
curl -X GET http://localhost:5000/api/v1/ai/provider \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Provider information retrieved",
  "data": {
    "name": "GitHub Models",
    "isConfigured": true
  }
}
```

### 2. POST /api/v1/ai/chat

General conversation with AI assistant.

```bash
curl -X POST http://localhost:5000/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "What makes a great novel?" }
    ]
  }'
```

**Request Format:**
```json
{
  "messages": [
    { "role": "user", "content": "Your question here" },
    { "role": "assistant", "content": "Previous response (optional)" }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Chat response generated",
  "data": {
    "response": "A great novel combines...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 3. POST /api/v1/ai/recommendations

Get personalized book recommendations.

```bash
curl -X POST http://localhost:5000/api/v1/ai/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": "I love sci-fi with philosophical themes, prefer modern authors"
  }'
```

**Request Format:**
```json
{
  "preferences": "Your reading preferences here"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book recommendations generated",
  "data": {
    "recommendations": "[{\"title\": \"...\", \"author\": \"...\", \"score\": 95}, ...]",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 4. POST /api/v1/ai/summarize

Generate a book summary.

```bash
curl -X POST http://localhost:5000/api/v1/ai/summarize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1984",
    "content": "In the year 1984, totalitarianism rules the world..."
  }'
```

**Request Format:**
```json
{
  "title": "Book Title",
  "content": "Full book text or description here"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book summary generated",
  "data": {
    "title": "1984",
    "summary": "In this dystopian novel...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 5. POST /api/v1/ai/compare

Compare two books.

```bash
curl -X POST http://localhost:5000/api/v1/ai/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "book1": "The Great Gatsby by F. Scott Fitzgerald",
    "book2": "The Beautiful and Damned by F. Scott Fitzgerald"
  }'
```

**Request Format:**
```json
{
  "book1": "Book 1 title and author",
  "book2": "Book 2 title and author"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book comparison generated",
  "data": {
    "book1": "The Great Gatsby by F. Scott Fitzgerald",
    "book2": "The Beautiful and Damned by F. Scott Fitzgerald",
    "comparison": "While both novels explore themes of the American Dream...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 6. POST /api/v1/ai/search

Semantic search across books.

```bash
curl -X POST http://localhost:5000/api/v1/ai/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mysterious detective solving crimes in foggy London",
    "context": [
      "Sherlock Holmes Series",
      "The Name of the Wind",
      "Agatha Christie Mysteries",
      "Harry Potter"
    ]
  }'
```

**Request Format:**
```json
{
  "query": "Search query describing what you're looking for",
  "context": ["Book 1", "Book 2", "Book 3"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Semantic search completed",
  "data": {
    "query": "mysterious detective solving crimes in foggy London",
    "results": "[{\"title\": \"Sherlock Holmes\", \"relevance\": 95}, ...]",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

### 7. POST /api/v1/ai/reading-plan

Generate a personalized reading plan.

```bash
curl -X POST http://localhost:5000/api/v1/ai/reading-plan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "genres": ["sci-fi", "mystery", "fantasy"],
    "duration": "3 months"
  }'
```

**Request Format:**
```json
{
  "genres": ["genre1", "genre2", "genre3"],
  "duration": "time period (e.g., '2 weeks', '1 month', '3 months')"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reading plan generated",
  "data": {
    "genres": ["sci-fi", "mystery", "fantasy"],
    "duration": "3 months",
    "readingPlan": "Month 1: Start with sci-fi classics...",
    "provider": { "name": "GitHub Models", "isConfigured": true }
  }
}
```

## Error Response Examples

### Missing Authentication Token

```bash
curl -X GET http://localhost:5000/api/v1/ai/provider
```

**Response (401):**
```json
{
  "success": false,
  "message": "No authorization token provided",
  "statusCode": 401
}
```

### Invalid Request Body

```bash
curl -X POST http://localhost:5000/api/v1/ai/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ }'  # Missing required 'preferences'
```

**Response (400):**
```json
{
  "success": false,
  "message": "Preferences string is required",
  "statusCode": 400
}
```

### Provider Not Configured

If using a provider without the necessary API key:

```bash
# With AI_PROVIDER=openai but no OPENAI_API_KEY set
curl -X POST http://localhost:5000/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hi"}]}'
```

**Response (500):**
```json
{
  "success": false,
  "message": "OpenAI provider is not configured. Please set API_KEY",
  "statusCode": 500
}
```

## Using Postman Collection

Create a Postman collection for easier testing:

### 1. Create New Collection: "AI Service Tests"

### 2. Add Environment Variables:
- `base_url`: http://localhost:5000
- `api_version`: /api/v1
- `token`: (paste your bearer token here)

### 3. Create Requests:

#### Get Provider
```
GET {{base_url}}{{api_version}}/ai/provider
Headers:
  Authorization: Bearer {{token}}
```

#### Chat
```
POST {{base_url}}{{api_version}}/ai/chat
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "messages": [
    { "role": "user", "content": "Recommend a book" }
  ]
}
```

#### Recommendations
```
POST {{base_url}}{{api_version}}/ai/recommendations
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "preferences": "sci-fi and mystery"
}
```

#### Summarize
```
POST {{base_url}}{{api_version}}/ai/summarize
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "title": "1984",
  "content": "In a totalitarian world..."
}
```

#### Compare
```
POST {{base_url}}{{api_version}}/ai/compare
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "book1": "The Great Gatsby",
  "book2": "The Beautiful and Damned"
}
```

#### Semantic Search
```
POST {{base_url}}{{api_version}}/ai/search
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "query": "detective stories",
  "context": ["Sherlock Holmes", "Harry Potter"]
}
```

#### Reading Plan
```
POST {{base_url}}{{api_version}}/ai/reading-plan
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "genres": ["sci-fi", "mystery"],
  "duration": "2 months"
}
```

## Testing in Frontend

### React Component Example

```typescript
import { useBookRecommendations, useAIChat } from '@/hooks/useAI';

export function AITester() {
  const recommendMutation = useBookRecommendations();
  const chatMutation = useAIChat();

  const testRecommendations = async () => {
    try {
      const result = await recommendMutation.mutateAsync({
        preferences: 'sci-fi and mystery novels'
      });
      console.log('Recommendations:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const testChat = async () => {
    try {
      const result = await chatMutation.mutateAsync({
        messages: [
          { role: 'user', content: 'What is your favorite book?' }
        ]
      });
      console.log('Chat response:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={testRecommendations} disabled={recommendMutation.isPending}>
        Test Recommendations
      </button>
      <button onClick={testChat} disabled={chatMutation.isPending}>
        Test Chat
      </button>
      
      {recommendMutation.data && <p>Recommendations: {recommendMutation.data}</p>}
      {chatMutation.data && <p>Chat: {chatMutation.data}</p>}
      {recommendMutation.error && <p>Error: {recommendMutation.error.message}</p>}
    </div>
  );
}
```

## Performance Testing

### Test Response Times

```bash
# Measure response time
time curl -X POST http://localhost:5000/api/v1/ai/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferences":"sci-fi"}'
```

Expected: < 5 seconds (varies by provider)

### Load Testing with Apache Bench

```bash
# Install ab if not present: brew install httpd

# Create body.json
{
  "preferences": "sci-fi and mystery novels"
}

# Run 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   -H "Content-Type: application/json" \
   -p body.json \
   http://localhost:5000/api/v1/ai/recommendations
```

## Troubleshooting

### "Provider is not configured"

Check your `.env` file:
```bash
cat backend/.env
```

Ensure the provider you want is configured:
```bash
# For GitHub (default, works without key)
AI_PROVIDER=github

# For OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### "No authorization token provided"

Make sure you're sending the token:
```bash
# ✗ Wrong
curl -X GET http://localhost:5000/api/v1/ai/provider

# ✓ Correct
curl -X GET http://localhost:5000/api/v1/ai/provider \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mock responses returned

This is normal if no API key is configured. To get real responses:
1. Get an API key from your provider
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Restart backend: `npm run dev`

### Invalid JSON response

Ensure Content-Type header is set:
```bash
-H "Content-Type: application/json"
```

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Authentication token obtained
- [ ] GET /ai/provider returns 200
- [ ] POST /ai/chat returns 200 with response
- [ ] POST /ai/recommendations returns 200
- [ ] POST /ai/summarize returns 200
- [ ] POST /ai/compare returns 200
- [ ] POST /ai/search returns 200
- [ ] POST /ai/reading-plan returns 200
- [ ] Error handling works (invalid requests return 400)
- [ ] Missing auth token returns 401
- [ ] Provider info endpoint works
- [ ] Frontend hooks can make requests
- [ ] Responses show correct provider name

## Sample Integration Test Script

```bash
#!/bin/bash

TOKEN="YOUR_TOKEN_HERE"
BASE_URL="http://localhost:5000/api/v1"

echo "Testing AI Architecture..."
echo ""

# Test 1: Check Provider
echo "1. Getting provider info..."
curl -X GET $BASE_URL/ai/provider \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""

# Test 2: Chat
echo "2. Testing chat..."
curl -X POST $BASE_URL/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hi"}]}' | jq .

echo ""

# Test 3: Recommendations
echo "3. Testing recommendations..."
curl -X POST $BASE_URL/ai/recommendations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preferences":"sci-fi"}' | jq .

echo ""
echo "All tests completed!"
```

---

**Remember:** All endpoints require authentication via Bearer token. Get a token by logging in first!
