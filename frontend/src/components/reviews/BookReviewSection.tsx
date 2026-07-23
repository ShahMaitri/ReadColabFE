import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBookRating, useBookReviews, useDeleteReview, useReviewEligibility } from '../../hooks/useReviews';
import type { ReviewData, ReviewSortOption } from '../../hooks/useReviews';
import { ReviewDialog } from './ReviewDialog';
import { ReviewEmptyState } from './ReviewEmptyState';
import { ReviewFilters } from './ReviewFilters';
import { ReviewList } from './ReviewList';
import { ReviewSkeleton } from './ReviewSkeleton';
import { ReviewSummary } from './ReviewSummary';

interface BookReviewSectionProps {
  bookId: string;
  bookTitle: string;
}

export const BookReviewSection = ({ bookId, bookTitle }: BookReviewSectionProps) => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | undefined>();

  const { data: ratingSummary, isLoading: ratingLoading } = useBookRating(bookId);
  const { data: reviewEligibility, isLoading: eligibilityLoading } = useReviewEligibility(bookId);
  const { data: reviewsResponse, isLoading: reviewsLoading, error } = useBookReviews(
    bookId,
    page,
    6,
    sortBy,
    ratingFilter,
    search
  );
  const deleteReviewMutation = useDeleteReview();

  const reviews = reviewsResponse?.data || [];
  const pagination = reviewsResponse?.pagination;
  const myReview = useMemo(
    () => reviews.find((review) => review.userId === user?.id),
    [reviews, user?.id]
  );
  const hasReview = Boolean(myReview || reviewEligibility?.hasExistingReview);
  const canWriteReview = user?.role === 'EMPLOYEE'
    && (reviewEligibility?.canWriteReview ?? false);
  const reviewActionDisabled = reviewsLoading || eligibilityLoading || !canWriteReview;
  const showReviewInfoIcon = user?.role === 'EMPLOYEE' && !hasReview && reviewActionDisabled && !eligibilityLoading;

  const openCreateDialog = () => {
    setEditingReview(myReview);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingReview(undefined);
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Reviews & Ratings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Read what employees think about {bookTitle}.
              </Typography>
            </Box>

            {user?.role === 'EMPLOYEE' && (
              <Box sx={{ textAlign: 'right' }}>
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<RateReviewIcon />}
                    onClick={openCreateDialog}
                    disabled={reviewActionDisabled}
                  >
                    {hasReview ? 'Edit Your Review' : 'Write Review'}
                  </Button>
                  {showReviewInfoIcon && (
                    <Tooltip
                      title="You can review this book only after borrowing and returning it."
                      placement="top"
                      arrow
                    >
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              {ratingLoading ? (
                <ReviewSkeleton count={1} />
              ) : ratingSummary ? (
                <ReviewSummary
                  averageRating={ratingSummary.averageRating}
                  totalReviews={ratingSummary.totalReviews}
                  distribution={ratingSummary.distribution}
                />
              ) : null}
            </Grid>
            <Grid item xs={12} md={7}>
              <ReviewFilters
                sortBy={sortBy}
                rating={ratingFilter}
                search={search}
                onSortChange={setSortBy}
                onRatingChange={(value) => {
                  setRatingFilter(value);
                  setPage(1);
                }}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />

              {error ? (
                <Alert severity="error">Failed to load reviews</Alert>
              ) : reviewsLoading ? (
                <ReviewSkeleton count={3} />
              ) : reviews.length > 0 ? (
                <ReviewList
                  reviews={reviews}
                  currentUserId={user?.id}
                  onEditReview={(review) => {
                    setEditingReview(review);
                    setDialogOpen(true);
                  }}
                    onDeleteReview={async (review) => {
                      if (confirm('Delete your review?')) {
                        await deleteReviewMutation.mutateAsync(review.id);
                      }
                    }}
                  emptyState={<ReviewEmptyState />}
                />
              ) : (
                <ReviewEmptyState />
              )}

              {pagination && pagination.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={pagination.pages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Stack>
      </CardContent>

      {dialogOpen && (
        <ReviewDialog
          open={dialogOpen}
          bookId={bookId}
          bookTitle={bookTitle}
          existingReview={editingReview ? { id: editingReview.id, rating: editingReview.rating, comment: editingReview.comment ?? '' } : undefined}
          onClose={closeDialog}
        />
      )}
    </Card>
  );
};
