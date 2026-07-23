import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Rating,
  Alert,
} from '@mui/material';

interface ReviewDialogProps {
  open: boolean;
  bookTitle: string;
  reviewType: 'BOOK' | 'OWNER' | 'BORROW_EXPERIENCE';
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isLoading?: boolean;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({
  open,
  bookTitle,
  reviewType,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [rating, setRating] = React.useState<number | null>(0);
  const [comment, setComment] = React.useState('');

  const handleSubmit = () => {
    if (rating) {
      onSubmit(rating, comment);
      setRating(0);
      setComment('');
    }
  };

  const reviewTypeLabels = {
    BOOK: `Rate the book "${bookTitle}"`,
    OWNER: `Rate the owner's service`,
    BORROW_EXPERIENCE: 'Rate your borrowing experience',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Review</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <Alert severity="info" sx={{ mb: 1 }}>
            {reviewTypeLabels[reviewType]}
          </Alert>

          <Box>
            <Typography variant="body2" gutterBottom>
              Rating *
            </Typography>
            <Rating
              value={rating}
              onChange={(_, value) => setRating(value)}
              size="large"
              disabled={isLoading}
            />
          </Box>

          <TextField
            label="Comment (Optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            disabled={isLoading}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!rating || isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
