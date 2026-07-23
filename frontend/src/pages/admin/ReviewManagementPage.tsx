import {
  Alert,
  Box,
  Container,
  Pagination,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useDeleteAdminReview, useAdminReviews } from '../../hooks/useReviews';
import type { ReviewSortOption, ReviewData } from '../../hooks/useReviews';
import { ReviewEmptyState } from '../../components/reviews/ReviewEmptyState';
import { ReviewFilters } from '../../components/reviews/ReviewFilters';
import { ReviewList } from '../../components/reviews/ReviewList';
import { ReviewSkeleton } from '../../components/reviews/ReviewSkeleton';

export const ReviewManagementPage = () => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [search, setSearch] = useState('');
  const [bookId, setBookId] = useState('');
  const [userId, setUserId] = useState('');

  const { data, isLoading, error } = useAdminReviews(page, 20, sortBy, {
    rating: ratingFilter,
    search,
    bookId: bookId.trim() || undefined,
    userId: userId.trim() || undefined
  });
  const deleteReviewMutation = useDeleteAdminReview();

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  const totalText = useMemo(() => `${pagination?.total || 0} reviews`, [pagination?.total]);

  const handleDelete = async (review: ReviewData) => {
    if (confirm(`Delete review from ${review.user?.name || 'this employee'}?`)) {
      await deleteReviewMutation.mutateAsync(review.id);
    }
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Failed to load review management data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Review Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Moderate all employee reviews and remove inappropriate content.
          </Typography>
        </Box>

        <Alert severity="info">Reported reviews support is reserved for future moderation data.</Alert>

        <ReviewFilters
          sortBy={sortBy}
          rating={ratingFilter}
          search={search}
          onSortChange={(value) => setSortBy(value)}
          onRatingChange={(value) => {
            setRatingFilter(value);
            setPage(1);
          }}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Book ID"
            value={bookId}
            onChange={(event) => setBookId(event.target.value)}
            fullWidth
          />
          <TextField
            label="Employee ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            fullWidth
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {totalText}
        </Typography>

        {isLoading ? (
          <ReviewSkeleton count={5} />
        ) : reviews.length > 0 ? (
          <ReviewList
            reviews={reviews}
            showBookInfo
            allowAllActions
            onDeleteReview={handleDelete}
            emptyState={<ReviewEmptyState title="No reviews found" />}
          />
        ) : (
          <ReviewEmptyState title="No reviews found" description="Try widening the search or clearing filters." />
        )}

        {pagination && pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination count={pagination.pages} page={page} onChange={(_, newPage) => setPage(newPage)} />
          </Box>
        )}
      </Stack>
    </Container>
  );
};
