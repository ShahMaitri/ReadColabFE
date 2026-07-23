import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { StarRating } from './StarRating';
import { useBookReviews, useDeleteReview, ReviewData } from '../../hooks/useReviews';

interface ReviewListProps {
  bookId: string;
  onEditReview?: (review: ReviewData) => void;
  currentUserId?: string;
}

export const ReviewList = ({ bookId, onEditReview, currentUserId }: ReviewListProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBookReviews(bookId, page, 5);
  const deleteReviewMutation = useDeleteReview();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, reviewId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedReviewId(reviewId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReviewId(null);
  };

  const handleEdit = (review: ReviewData) => {
    handleMenuClose();
    onEditReview?.(review);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReviewMutation.mutateAsync(reviewId);
      } catch (err) {
        console.error('Failed to delete review:', err);
      }
    }
    handleMenuClose();
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Failed to load reviews</Alert>;
  }

  if (!data?.data || data.data.length === 0) {
    return <Typography color="textSecondary">No reviews yet</Typography>;
  }

  return (
    <Box>
      {data.data.map((review) => (
        <Card key={review.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={review.user?.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {review.user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{review.user?.name || 'Anonymous'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {currentUserId === review.userId && (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, review.id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={selectedReviewId === review.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEdit(review)}>Edit</MenuItem>
                    <MenuItem
                      onClick={() => handleDelete(review.id)}
                      disabled={deleteReviewMutation.isPending}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            <StarRating value={review.rating} readOnly showValue size="small" />

            {review.comment && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      {data.pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={data.pagination.pages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </Box>
      )}
    </Box>
  );
};
