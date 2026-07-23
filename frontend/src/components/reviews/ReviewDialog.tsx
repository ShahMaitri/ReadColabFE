import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import { ReviewForm } from './ReviewForm';
import type { ReviewFormValues } from './ReviewForm';
import { useCreateReview, useUpdateReview } from '../../hooks/useReviews';

interface ReviewDialogProps {
  open: boolean;
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  existingReview?: { id: string; rating: number; comment?: string | null };
}

export const ReviewDialog = ({
  open,
  bookId,
  bookTitle,
  onClose,
  existingReview
}: ReviewDialogProps) => {
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const isSubmitting = createReviewMutation.isPending || updateReviewMutation.isPending;
  const error = createReviewMutation.error || updateReviewMutation.error;

  const getErrorMessage = (): string | null => {
    if (!error) {
      return null;
    }

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Failed to submit review.';
  };

  const handleSubmit = async (values: ReviewFormValues) => {
    if (existingReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: existingReview.id,
        rating: values.rating,
        comment: values.comment
      });
    } else {
      await createReviewMutation.mutateAsync({
        bookId,
        rating: values.rating,
        comment: values.comment
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{existingReview ? 'Edit Review' : 'Write a Review'} - {bookTitle}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <ReviewForm
          defaultValues={{
            rating: existingReview?.rating ?? 0,
            comment: existingReview?.comment ?? ''
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={existingReview ? 'Update Review' : 'Post Review'}
          isSubmitting={isSubmitting}
          error={getErrorMessage()}
        />
      </DialogContent>
    </Dialog>
  );
};
