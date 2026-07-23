import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { StarRating } from './StarRating';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export const ReviewSummary = ({ averageRating, totalReviews, distribution }: ReviewSummaryProps) => {
  const rows = [5, 4, 3, 2, 1].map((rating) => {
    const count = distribution[rating] || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    return { rating, count, percentage };
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Average Rating
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {averageRating.toFixed(1)}
              </Typography>
              <StarRating value={averageRating} readOnly showValue={false} size="large" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {totalReviews} total reviews
            </Typography>
          </Box>

          <Stack spacing={1.25}>
            {rows.map((row) => (
              <Box key={row.rating} sx={{ display: 'grid', gridTemplateColumns: '44px 1fr 48px', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {row.rating} ★
                </Typography>
                <LinearProgress variant="determinate" value={row.percentage} sx={{ height: 8, borderRadius: 999 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                  {row.count}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
