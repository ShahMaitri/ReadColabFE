import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';
import { authStorage } from '../utils/storage';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  cover?: string;
  description?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  status: string;
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  book?: Book;
}

export interface WishlistItem {
  id: string;
  bookId: string;
  createdAt: string;
  book?: Book;
}

export interface ReviewRecord {
  id: string;
  bookId: string;
  rating: number;
  review: string;
  createdAt: string;
  book?: Book;
}

interface ActivityRecord {
  type: string;
  title: string;
  date: string;
  book?: Book;
}

interface RecommendedBookItem {
  title: string;
  author: string;
}

const sanitizeRecommendationItem = (item: unknown): RecommendedBookItem | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!title) {
    return null;
  }

  return {
    title,
    author: typeof record.author === 'string' && record.author.trim() ? record.author.trim() : 'Recommended'
  };
};

const normalizeRecommendationArray = (items: unknown[]): RecommendedBookItem[] => {
  return items
    .map((item) => sanitizeRecommendationItem(item))
    .filter((item): item is RecommendedBookItem => Boolean(item))
    .slice(0, 25);
};

const parseJsonRecommendationString = (value: string): RecommendedBookItem[] => {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return normalizeRecommendationArray(parsed);
    }

    if (parsed && typeof parsed === 'object') {
      const recommendations = (parsed as Record<string, unknown>).recommendations;
      if (Array.isArray(recommendations)) {
        return normalizeRecommendationArray(recommendations);
      }
    }
  } catch (_error) {
    // Not JSON; fallback to plain text parsing.
  }

  return [];
};

const parseRecommendationText = (value: string): RecommendedBookItem[] => {
  const normalizedValue = value.replace(/\\"/g, '"');
  const titleMatches = Array.from(normalizedValue.matchAll(/"title"\s*:\s*"([^"]+)"/g));

  if (titleMatches.length > 0) {
    const authorMatches = Array.from(normalizedValue.matchAll(/"author"\s*:\s*"([^"]+)"/g));
    return titleMatches
      .map((match, index) => ({
        title: match[1].trim(),
        author: authorMatches[index]?.[1]?.trim() || 'Recommended'
      }))
      .filter((item) => item.title.length > 0)
      .slice(0, 25);
  }

  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .map((line) => {
      const bySplit = line.split(/\s+by\s+/i);
      if (bySplit.length >= 2) {
        return {
          title: bySplit[0].trim().replace(/^"|"$/g, ''),
          author: bySplit.slice(1).join(' by ').trim()
        };
      }

      const dashSplit = line.split(/\s[-–]\s/);
      if (dashSplit.length >= 2) {
        return {
          title: dashSplit[0].trim().replace(/^"|"$/g, ''),
          author: dashSplit.slice(1).join(' - ').trim()
        };
      }

      return {
        title: line.replace(/^"|"$/g, ''),
        author: 'Recommended'
      };
    })
    .filter((item) => item.title.length > 0)
    .slice(0, 25);
};

const normalizeRecommendations = (raw: unknown): RecommendedBookItem[] => {
  if (Array.isArray(raw)) {
    return normalizeRecommendationArray(raw);
  }

  if (raw && typeof raw === 'object') {
    const recommendations = (raw as Record<string, unknown>).recommendations;
    if (Array.isArray(recommendations)) {
      return normalizeRecommendationArray(recommendations);
    }
  }

  if (typeof raw === 'string' && raw.trim()) {
    const parsedJsonItems = parseJsonRecommendationString(raw);
    if (parsedJsonItems.length > 0) {
      return parsedJsonItems;
    }
    return parseRecommendationText(raw);
  }

  return [];
};

// Get all available books
export const useAvailableBooks = () => {
  return useQuery({
    queryKey: ['availableBooks'],
    queryFn: async () => {
      const response = await apiClient.get('/books', {
        params: { limit: 100 }
      });
      return response.data.data?.data || [];
    }
  });
};

// Get recently added books
export const useRecentlyAddedBooks = () => {
  return useQuery({
    queryKey: ['recentlyAdded'],
    queryFn: async () => {
      const response = await apiClient.get('/books', {
        params: {
          limit: 6,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      return response.data.data?.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Get user's borrowed books with details
export const useUserBorrows = () => {
  return useQuery({
    queryKey: ['userBorrows'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/borrow/history', {
          params: { page: 1, limit: 100 }
        });
        return response.data.data?.data || [];
      } catch (error) {
        return [];
      }
    }
  });
};

// Get user's wishlist
export const useUserWishlist = (userId?: string) => {
  return useQuery({
    queryKey: ['userWishlist', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await apiClient.get('/wishlist');
      return response.data.data?.data || [];
    }
  });
};

// Get user's reviews/reading history
export const useUserReviews = () => {
  return useQuery({
    queryKey: ['userReviews'],
    queryFn: async () => {
      const response = await apiClient.get('/reviews');
      return response.data.data || [];
    }
  });
};

// Get recommended books from AI
export const useRecommendedBooks = () => {
  return useQuery({
    queryKey: ['recommendedBooks'],
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    queryFn: async () => {
      try {
        const response = await apiClient.post('/ai/recommendations', {
          preferences: 'general recommendations based on popular books'
        });
        const normalized = normalizeRecommendations(response.data.data?.recommendations);
        if (normalized.length > 0) {
          return normalized;
        }
      } catch (error) {
        // Ignore and fallback below
      }

      const fallbackResponse = await apiClient.get('/books', {
        params: {
          limit: 25,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      const fallbackBooks = fallbackResponse.data.data?.data || [];
      return fallbackBooks.map((book: any) => ({
        title: book.title,
        author: book.author || 'Unknown'
      }));
    },
    staleTime: 60 * 1000 // 1 minute
  });
};

// Get trending books (most borrowed)
export const useTrendingBooks = () => {
  return useQuery({
    queryKey: ['trendingBooks'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/analytics/trending-books');
        return response.data.data || [];
      } catch (error) {
        // If analytics endpoint not available, get all books sorted by availability
        const response = await apiClient.get('/books', {
          params: { limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }
        });
        return response.data.data || [];
      }
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
};

// Get reading statistics for current user
export const useReadingStatistics = () => {
  return useQuery({
    queryKey: ['readingStats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/analytics/user-stats');
        return response.data.data || {
          totalBorrowed: 0,
          totalReturned: 0,
          totalOverdue: 0,
          booksWishlisted: 0,
          booksReviewed: 0,
          averageRating: 0
        };
      } catch (error) {
        return {
          totalBorrowed: 0,
          totalReturned: 0,
          totalOverdue: 0,
          booksWishlisted: 0,
          booksReviewed: 0,
          averageRating: 0
        };
      }
    }
  });
};

// Get books due soon for user
export const useDueSoonBooks = () => {
  return useQuery({
    queryKey: ['dueSoon'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/borrow/user/due-soon');
        return response.data.data || [];
      } catch (error) {
        return [];
      }
    }
  });
};

// Get recent activity (borrows, returns, reviews)
export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      try {
        const currentUser = authStorage.getUser<{ role?: string }>();
        const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

        if (isAdmin) {
          const response = await apiClient.get('/analytics/activity/recent', {
            params: { limit: 20 }
          });

          const adminActivities = (response.data?.data || []) as Array<{
            type?: string;
            timestamp?: string;
            status?: string;
            user?: { name?: string };
            book?: { title?: string };
          }>;

          return adminActivities
            .map((item): ActivityRecord => {
              const actor = item.user?.name ? `${item.user.name} ` : '';
              const bookTitle = item.book?.title || 'book';
              const action =
                item.type === 'return'
                  ? 'returned'
                  : item.type === 'reservation'
                    ? 'reserved'
                    : item.status === 'PENDING'
                      ? 'requested'
                      : 'borrowed';

              return {
                type: item.type || 'activity',
                title: `${actor}${action} "${bookTitle}"`,
                date: item.timestamp || new Date().toISOString(),
                book: item.book as Book | undefined
              };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 8);
        }

        const [borrows, reviews] = await Promise.all([
          apiClient.get('/borrow/history', {
            params: { page: 1, limit: 20 }
          }),
          apiClient.get('/reviews/me', {
            params: { page: 1, limit: 20 }
          })
        ]);

        const borrowEntries = borrows.data?.data?.data || [];
        const reviewEntries = reviews.data?.data || [];

        const activities: ActivityRecord[] = [
          ...borrowEntries.map((b: BorrowRecord & { createdAt?: string; updatedAt?: string }) => ({
            type: 'borrow',
            title:
              b.status === 'RETURNED'
                ? `Returned "${b.book?.title}"`
                : b.status === 'PENDING'
                  ? `Requested "${b.book?.title}"`
                  : `Borrowed "${b.book?.title}"`,
            date: b.returnDate || b.borrowDate || b.createdAt || b.updatedAt || new Date().toISOString(),
            book: b.book
          })),
          ...reviewEntries.map((r: ReviewRecord) => ({
            type: 'review',
            title: `Reviewed "${r.book?.title}" (${r.rating}★)`,
            date: r.createdAt,
            book: r.book
          }))
        ];

        return activities
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);
      } catch (error) {
        return [];
      }
    }
  });
};
