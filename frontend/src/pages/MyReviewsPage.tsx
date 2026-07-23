import {
  Alert,
  Box,
  Container,
  Pagination,
  Stack,
  Typography
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

export const MyReviewsPage = () => {
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

  const currentReviewTitle = useMemo(() => editingReview?.book?.title || 'Review', [editingReview]);

  const handleDelete = async (review: ReviewData) => {
    if (confirm(`Delete your review for ${review.book?.title || 'this book'}?`)) {
      await deleteReviewMutation.mutateAsync(review.id);
    }
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Failed to load your reviews</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            My Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review history for your borrowed and returned books.
          </Typography>
        </Box>

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
          <ReviewEmptyState title="No reviews yet" description="Your submitted reviews will appear here." />
        )}

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
    </Container>
  );
};
