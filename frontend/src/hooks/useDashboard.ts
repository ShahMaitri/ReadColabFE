import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

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
        const response = await apiClient.get('/borrow/user/books');
        return response.data.data || [];
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
    queryFn: async () => {
      try {
        const response = await apiClient.post('/ai/recommendations', {
          preferences: 'general recommendations based on popular books'
        });
        return response.data.data?.recommendations || [];
      } catch (error) {
        // Fallback to recent books if AI endpoint fails
        return [];
      }
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
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
        const [borrows, reviews] = await Promise.all([
          apiClient.get('/borrow/history'),
          apiClient.get('/reviews')
        ]);

        const activities = [
          ...(borrows.data.data || []).map((b: BorrowRecord) => ({
            type: 'borrow',
            title: `Borrowed "${b.book?.title}"`,
            date: b.borrowDate || new Date().toISOString(),
            book: b.book
          })),
          ...(reviews.data.data || []).map((r: ReviewRecord) => ({
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
