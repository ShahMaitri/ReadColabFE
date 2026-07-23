import { Alert, Box, Typography } from '@mui/material';

interface ReviewEmptyStateProps {
  title?: string;
  description?: string;
}

export const ReviewEmptyState = ({
  title = 'No reviews yet',
  description = 'Be the first to share your thoughts on this book.'
}: ReviewEmptyStateProps) => {
  return (
    <Alert severity="info">
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </Box>
    </Alert>
  );
};
