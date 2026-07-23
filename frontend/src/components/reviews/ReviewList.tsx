import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMemo, useState, type ReactNode } from 'react';
import type { ReviewData } from '../../hooks/useReviews';
import { StarRating } from './StarRating';

interface ReviewListProps {
  reviews: ReviewData[];
  currentUserId?: string;
  onEditReview?: (review: ReviewData) => void;
  onDeleteReview?: (review: ReviewData) => void;
  showBookInfo?: boolean;
  emptyState?: ReactNode;
  allowAllActions?: boolean;
}

export const ReviewList = ({
  reviews,
  currentUserId,
  onEditReview,
  onDeleteReview,
  showBookInfo = false,
  emptyState,
  allowAllActions = false
}: ReviewListProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const selectedReview = useMemo(
    () => reviews.find((review) => review.id === selectedReviewId) || null,
    [reviews, selectedReviewId]
  );

  const closeMenu = () => {
    setMenuAnchor(null);
    setSelectedReviewId(null);
  };

  if (!reviews.length) {
    return <>{emptyState}</>;
  }

  return (
    <Stack spacing={2}>
      {reviews.map((review) => {
        const canManage = allowAllActions || (currentUserId ? review.userId === currentUserId : false);

        return (
          <Card key={review.id}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={review.user?.avatar}>{review.user?.name?.charAt(0) || 'U'}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {review.user?.name || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  {canManage && (onEditReview || onDeleteReview) && (
                    <>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          setMenuAnchor(event.currentTarget);
                          setSelectedReviewId(review.id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu anchorEl={menuAnchor} open={selectedReview?.id === review.id} onClose={closeMenu}>
                        {onEditReview && <MenuItem onClick={() => { onEditReview(review); closeMenu(); }}>Edit</MenuItem>}
                        {onDeleteReview && <MenuItem onClick={() => { onDeleteReview(review); closeMenu(); }} sx={{ color: 'error.main' }}>Delete</MenuItem>}
                      </Menu>
                    </>
                  )}
                </Box>

                {showBookInfo && review.book && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {review.book.title}
                    </Typography>
                    {review.book.author && (
                      <Typography variant="body2" color="text.secondary">
                        {review.book.author}
                      </Typography>
                    )}
                  </Box>
                )}

                <StarRating value={review.rating} readOnly showValue size="small" />

                {review.comment ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {review.comment}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No comment provided.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};
