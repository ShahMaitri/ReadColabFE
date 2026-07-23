import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Stack,
  Avatar,
} from '@mui/material';
import type { PersonalBookWithOwner } from '../../api/personalBook.api';
import BookIcon from '@mui/icons-material/Book';

interface PersonalBookCardProps {
  book: PersonalBookWithOwner;
  onViewDetails?: (book: PersonalBookWithOwner) => void;
  onRequest?: (bookId: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

const availabilityColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  AVAILABLE: 'success',
  BORROWED: 'warning',
  RESERVED: 'info',
  UNAVAILABLE: 'error',
  SOLD: 'error',
  DONATED: 'error',
};

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  OLD: 'Old',
  DAMAGED: 'Damaged',
};

export const PersonalBookCard: React.FC<PersonalBookCardProps> = ({
  book,
  onViewDetails,
  onRequest,
  isLoading = false,
  showActions = true,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Book Cover */}
      {book.coverImage ? (
        <CardMedia
          component="img"
          height="250"
          image={book.coverImage}
          alt={book.title}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <BookIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
        </Box>
      )}

      <CardHeader
        avatar={
          <Avatar
            src={book.owner?.avatar}
            alt={book.owner?.name}
            sx={{ width: 32, height: 32 }}
          >
            {book.owner?.name?.charAt(0)}
          </Avatar>
        }
        title={<Typography variant="body2">{book.owner?.name}</Typography>}
        titleTypographyProps={{ noWrap: true }}
        subheader={<Typography variant="caption">Owner</Typography>}
        sx={{ py: 1, px: 2 }}
      />

      <CardContent sx={{ flexGrow: 1, py: 1, px: 2 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 0.5,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {book.title}
        </Typography>

        {/* Author */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          by {book.author}
        </Typography>

        {/* ISBN and Category */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {book.isbn && (
            <Chip label={`ISBN: ${book.isbn}`} size="small" variant="outlined" />
          )}
          {book.category && (
            <Chip label={book.category} size="small" color="primary" />
          )}
        </Box>

        {/* Rating and Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating
            value={Math.round(book.averageRating * 2) / 2}
            readOnly
            size="small"
          />
          <Typography variant="caption" color="textSecondary">
            ({book._count?.reviews || 0} reviews)
          </Typography>
        </Box>

        {/* Condition and Availability */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={conditionLabels[book.condition] || book.condition}
            size="small"
            variant="outlined"
          />
          <Chip
            label={book.availabilityStatus}
            size="small"
            color={availabilityColors[book.availabilityStatus]}
            variant="filled"
          />
        </Box>

        {/* Borrow Count */}
        {book.borrowCount > 0 && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            Borrowed {book.borrowCount} times
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onViewDetails?.(book)}
          >
            View Details
          </Button>
          {book.availabilityStatus === 'AVAILABLE' && (
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => onRequest?.(book.id)}
              disabled={isLoading}
            >
              Request
            </Button>
          )}
        </Box>
      )}
    </Card>
  );
};
