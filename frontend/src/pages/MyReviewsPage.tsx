import {
  alpha,
  Alert,
  Box,
  Pagination,
  Stack,
  Typography,
  Paper
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDeleteReview, useMyReviews } from '../hooks/useReviews';
import type { ReviewData, ReviewSortOption } from '../hooks/useReviews';
import { ReviewDialog } from '../components/reviews/ReviewDialog';
import { ReviewEmptyState } from '../components/reviews/ReviewEmptyState';
import { ReviewFilters } from '../components/reviews/ReviewFilters';
import { ReviewList } from '../components/reviews/ReviewList';
import { ReviewSkeleton } from '../components/reviews/ReviewSkeleton';
import { useTheme } from '@mui/material/styles';

export const MyReviewsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [search, setSearch] = useState('');
  const [editingReview, setEditingReview] = useState<ReviewData | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useMyReviews(page, 10, sortBy, ratingFilter, search);
  const deleteReviewMutation = useDeleteReview();

  const reviews = data?.data || [];
  const pagination = data?.pagination;
  const hasAnyReviews = (pagination?.total ?? 0) > 0;
  const hasActiveFilters = Boolean(search.trim()) || ratingFilter !== undefined || sortBy !== 'newest';

  const currentReviewTitle = useMemo(() => editingReview?.book?.title || 'Review', [editingReview]);

  const handleDelete = async (review: ReviewData) => {
    if (confirm(`Delete your review for ${review.book?.title || 'this book'}?`)) {
      await deleteReviewMutation.mutateAsync(review.id);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load your reviews</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: '12px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, 0.24)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`
                : `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.24)} 0%, ${alpha('#ffffff', 0.97)} 100%)`
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            My Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review history for your borrowed and returned books.
          </Typography>
        </Paper>

        {(hasAnyReviews || hasActiveFilters) && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
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
          </Paper>
        )}

        <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          {isLoading ? (
            <ReviewSkeleton count={4} />
          ) : reviews.length > 0 ? (
            <ReviewList
              reviews={reviews}
              currentUserId={user?.id}
              showBookInfo
              onEditReview={(review) => {
                setEditingReview(review);
                setDialogOpen(true);
              }}
              onDeleteReview={handleDelete}
              emptyState={<ReviewEmptyState title="No reviews yet" />}
            />
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No reviews yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your submitted reviews will appear here.
              </Typography>
            </Paper>
          )}
        </Paper>

        {pagination && pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination count={pagination.pages} page={page} onChange={(_, newPage) => setPage(newPage)} />
          </Box>
        )}
      </Stack>

      {dialogOpen && editingReview && (
        <ReviewDialog
          open={dialogOpen}
          bookId={editingReview.bookId}
          bookTitle={currentReviewTitle}
          existingReview={{
            id: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.comment ?? ''
          }}
          onClose={() => {
            setDialogOpen(false);
            setEditingReview(undefined);
          }}
        />
      )}
    </Box>
  );
};
