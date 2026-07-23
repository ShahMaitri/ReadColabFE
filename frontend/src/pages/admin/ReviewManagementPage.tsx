import {
  alpha,
  Alert,
  Box,
  Container,
  Pagination,
  Paper,
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
  const [userName, setUserName] = useState('');

  const { data, isLoading, error } = useAdminReviews(page, 20, sortBy, {
    rating: ratingFilter,
    search: userName.trim() ? undefined : search,
    bookId: bookId.trim() || undefined,
    userName: userName.trim() || undefined
  });
  const deleteReviewMutation = useDeleteAdminReview();
  const hasLoadError = Boolean(error);

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  const totalText = useMemo(() => `${pagination?.total || 0} reviews`, [pagination?.total]);

  const handleDelete = async (review: ReviewData) => {
    if (confirm(`Delete review from ${review.user?.name || 'this employee'}?`)) {
      await deleteReviewMutation.mutateAsync(review.id);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, 0.24)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`
                : `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.24)} 0%, ${alpha('#ffffff', 0.97)} 100%)`
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all book reviews with reviewer details and moderate inappropriate content.
          </Typography>
        </Paper>

        <Alert severity="info">Reported reviews support is reserved for future moderation data.</Alert>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Book ID"
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              fullWidth
            />
            <TextField
              label="Employee Name"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              fullWidth
            />
          </Stack>
        </Paper>

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
          <ReviewEmptyState
            title={hasLoadError ? 'No reviews available' : 'No reviews found'}
            description={
              hasLoadError
                ? 'Unable to load reviews right now. Please try again shortly.'
                : 'Try widening the search or clearing filters.'
            }
          />
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
