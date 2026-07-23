import { Box, Rating, Typography } from '@mui/material';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  showValue?: boolean;
  size?: 'small' | 'medium' | 'large';
  precision?: number;
}

export const StarRating = ({ 
  value, 
  onChange, 
  readOnly = false,
  showValue = true,
  size = 'medium',
  precision = readOnly ? 0.5 : 1
}: StarRatingProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Rating
        value={value}
        onChange={(_, newValue) => {
          if (!readOnly && onChange && newValue) {
            onChange(newValue);
          }
        }}
        readOnly={readOnly}
        size={size}
        precision={precision}
      />
      {showValue && (
        <Typography variant="body2" sx={{ minWidth: '30px' }}>
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};
