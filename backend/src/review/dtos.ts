import { ReviewSortOption } from '../repositories/review.repository';

export interface ReviewListQueryDTO {
  page: number;
  limit: number;
  sortBy: ReviewSortOption;
  rating?: number;
  search?: string;
}

export interface AdminReviewFiltersDTO extends ReviewListQueryDTO {
  bookId?: string;
  userId?: string;
  reportedOnly?: boolean;
}

export interface ReviewRatingSummaryDTO {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface BookWithReviewStatsDTO {
  averageRating: number;
  totalReviews: number;
}

export interface ReviewSummaryDTO {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
