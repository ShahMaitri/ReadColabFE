import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useState } from 'react';
import { StarRating } from './StarRating';
import { useCreateReview, useUpdateReview } from '../../hooks/useReviews';

interface ReviewDialogProps {
  open: boolean;
  bookId: string;
  onClose: () => void;
  existingReview?: { id: string; rating: number; comment?: string };
  bookTitle: string;
}

export const ReviewDialog = ({
  open,
  bookId,
  onClose,
  existingReview,
  bookTitle
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const isLoading = createReviewMutation.isPending || updateReviewMutation.isPending;
  const error = createReviewMutation.error || updateReviewMutation.error;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      if (existingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: existingReview.id,
          rating,
          comment: comment || undefined
        });
      } else {
        await createReviewMutation.mutateAsync({
          bookId,
          rating,
          comment: comment || undefined
        });
      }
      handleClose();
    } catch (err) {
      // Error handled by mutation
      console.error('Review submission error:', err);
    }
  };

  const handleClose = () => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {existingReview ? 'Edit Review' : 'Write a Review'} - {bookTitle}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Failed to save review'}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <StarRating value={rating} onChange={setRating} readOnly={false} />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="Share your thoughts about this book..."
          disabled={isLoading}
          helperText={`${comment.length}/500 characters`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || rating === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Saving...' : existingReview ? 'Update Review' : 'Post Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
