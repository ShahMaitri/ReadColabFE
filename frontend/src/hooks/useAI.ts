import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// Types
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: AIMessage[];
}

export interface RecommendationRequest {
  preferences: string;
}

export interface SummarizeRequest {
  title: string;
  content: string;
}

export interface CompareRequest {
  book1: string;
  book2: string;
}

export interface SemanticSearchRequest {
  query: string;
  context: string[];
}

export interface ReadingPlanRequest {
  genres: string[];
  duration: string;
}

export interface ProviderInfo {
  name: string;
  isConfigured: boolean;
}

// Query keys factory
const aiKeys = {
  all: ['ai'] as const,
  provider: () => [...aiKeys.all, 'provider'] as const
};

/**
 * Get current AI provider information
 */
export function useAIProvider() {
  return useQuery({
    queryKey: aiKeys.provider(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: ProviderInfo }>('/ai/provider');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Chat with AI assistant
 */
export function useAIChat() {
  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      const response = await apiClient.post('/ai/chat', request);
      return response.data.data.response;
    }
  });
}

/**
 * Get book recommendations based on preferences
 */
export function useBookRecommendations() {
  return useMutation({
    mutationFn: async (request: RecommendationRequest) => {
      const response = await apiClient.post('/ai/recommendations', request);
      return response.data.data.recommendations;
    }
  });
}

/**
 * Summarize a book
 */
export function useBookSummary() {
  return useMutation({
    mutationFn: async (request: SummarizeRequest) => {
      const response = await apiClient.post('/ai/summarize', request);
      return response.data.data.summary;
    }
  });
}

/**
 * Compare two books
 */
export function useBookComparison() {
  return useMutation({
    mutationFn: async (request: CompareRequest) => {
      const response = await apiClient.post('/ai/compare', request);
      return response.data.data.comparison;
    }
  });
}

/**
 * Perform semantic search across books
 */
export function useSemanticSearch() {
  return useMutation({
    mutationFn: async (request: SemanticSearchRequest) => {
      const response = await apiClient.post('/ai/search', request);
      return response.data.data.results;
    }
  });
}

/**
 * Generate a personalized reading plan
 */
export function useReadingPlan() {
  return useMutation({
    mutationFn: async (request: ReadingPlanRequest) => {
      const response = await apiClient.post('/ai/reading-plan', request);
      return response.data.data.readingPlan;
    }
  });
}
