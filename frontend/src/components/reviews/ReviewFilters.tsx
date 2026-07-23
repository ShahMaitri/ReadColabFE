import { Box, MenuItem, Stack, TextField } from '@mui/material';
import type { ReviewSortOption } from '../../hooks/useReviews';

interface ReviewFiltersProps {
  sortBy: ReviewSortOption;
  rating?: number;
  search: string;
  onSortChange: (value: ReviewSortOption) => void;
  onRatingChange: (value?: number) => void;
  onSearchChange: (value: string) => void;
}

export const ReviewFilters = ({
  sortBy,
  rating,
  search,
  onSortChange,
  onRatingChange,
  onSearchChange
}: ReviewFiltersProps) => {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <TextField
        select
        label="Sort By"
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value as ReviewSortOption)}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="newest">Newest</MenuItem>
        <MenuItem value="oldest">Oldest</MenuItem>
        <MenuItem value="highestRating">Highest Rating</MenuItem>
        <MenuItem value="lowestRating">Lowest Rating</MenuItem>
      </TextField>

      <TextField
        select
        label="Rating"
        value={rating ?? ''}
        onChange={(event) => onRatingChange(event.target.value ? Number(event.target.value) : undefined)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All Ratings</MenuItem>
        <MenuItem value={5}>5 Stars</MenuItem>
        <MenuItem value={4}>4 Stars</MenuItem>
        <MenuItem value={3}>3 Stars</MenuItem>
        <MenuItem value={2}>2 Stars</MenuItem>
        <MenuItem value={1}>1 Star</MenuItem>
      </TextField>

      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          label="Search reviews"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by comment, book, or reviewer"
        />
      </Box>
    </Stack>
  );
};
