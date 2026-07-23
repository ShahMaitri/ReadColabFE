import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Chip
} from '@mui/material';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useNotification } from '../context/NotificationContext';
import { useRequestBorrow } from '../hooks/useBorrowReservation';

export const WishlistPage = () => {
  const [page, setPage] = useState(1);
  const { showNotification } = useNotification();
  const { data, isLoading, error } = useWishlist(page, 12);
  const { mutate: requestBorrow, isPending: isBorrowing } = useRequestBorrow();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const handleRemove = async (bookId: string) => {
    if (confirm('Remove this book from your wishlist?')) {
      try {
        await removeFromWishlistMutation.mutateAsync(bookId);
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
      }
    }
  };

  const handleBorrow = (bookId: string) => {
    requestBorrow(bookId, {
      onSuccess: () => {
        showNotification('Borrow request submitted successfully!', 'success');
      },
      onError: (error: any) => {
        showNotification(
          error.response?.data?.message || 'Failed to request borrow',
          'error'
        );
      }
    });
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Failed to load wishlist</Alert>
      </Container>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Your wishlist is empty
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Add books to your wishlist to save them for later
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Wishlist
      </Typography>

      <Grid container spacing={3}>
        {data.data.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              {item.book.cover && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.book.cover}
                  alt={item.book.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="subtitle1" noWrap>
                  {item.book.title}
                </Typography>

                <Typography variant="body2" color="textSecondary" noWrap>
                  {item.book.author}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={item.book.category || 'Uncategorized'}
                    size="small"
                    variant="outlined"
                  />
                  {item.book.availableQuantity > 0 ? (
                    <Chip
                      label={`${item.book.availableQuantity} available`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Out of stock"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleBorrow(item.bookId)}
                  disabled={item.book.availableQuantity === 0 || isBorrowing}
                >
                  Borrow
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => handleRemove(item.bookId)}
                  disabled={removeFromWishlistMutation.isPending}
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {data.pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={data.pagination.pages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </Box>
      )}
    </Container>
  );
};
