import {
  alpha,
  Box,
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
  Chip,
  Paper
} from '@mui/material';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useNotification } from '../context/NotificationContext';
import { useBorrowHistory, useRequestBorrow } from '../hooks/useBorrowReservation';
import { resolveCoverImageUrl } from '../utils/media';
import { useTheme } from '@mui/material/styles';

export const WishlistPage = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const { showNotification } = useNotification();
  const { data, isLoading, error } = useWishlist(page, 12);
  const { data: borrowHistory } = useBorrowHistory(1, 200);
  const { mutate: requestBorrow, isPending: isBorrowing } = useRequestBorrow();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const getLatestBorrowForBook = (bookId: string) => {
    const entries = (borrowHistory?.data || []).filter((entry) => entry.bookId === bookId);
    if (entries.length === 0) {
      return undefined;
    }

    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const getStatusChipProps = (status?: string): { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' } => {
    switch (status) {
      case 'PENDING':
        return { label: 'Borrow Requested', color: 'warning' };
      case 'APPROVED':
        return { label: 'Approved (Not Borrowed Yet)', color: 'info' };
      case 'BORROWED':
        return { label: 'Borrowed', color: 'success' };
      case 'OVERDUE':
        return { label: 'Overdue', color: 'error' };
      case 'RETURNED':
        return { label: 'Returned', color: 'default' };
      case 'REJECTED':
        return { label: 'Rejected', color: 'error' };
      default:
        return { label: 'Not Requested', color: 'default' };
    }
  };

  const getBorrowActionState = (status?: string): { label: string; disabled: boolean } => {
    switch (status) {
      case 'PENDING':
        return { label: 'Requested', disabled: true };
      case 'APPROVED':
        return { label: 'Not Borrowed Yet', disabled: true };
      case 'BORROWED':
        return { label: 'Borrowed', disabled: true };
      case 'OVERDUE':
        return { label: 'Overdue', disabled: true };
      default:
        return { label: 'Borrow', disabled: false };
    }
  };

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
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load wishlist</Alert>
      </Box>
    );
  }

  const hasWishlistItems = Boolean(data?.data && data.data.length > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, 0.24)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`
              : `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.24)} 0%, ${alpha('#ffffff', 0.97)} 100%)`
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          My Wishlist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Curated books you want to read next.
        </Typography>
      </Paper>

      {hasWishlistItems ? (
        <Grid container spacing={3}>
          {data!.data.map((item) => (
            (() => {
              const latestBorrow = getLatestBorrowForBook(item.bookId);
              const statusChip = getStatusChipProps(latestBorrow?.status);
              const actionState = getBorrowActionState(latestBorrow?.status);

              return (
            <Grid
              key={item.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
              sx={{ minWidth: 0 }}
            >
              <Card
                sx={{
                  height: '100%',
                  minWidth: 0,
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={resolveCoverImageUrl(item.book.cover)}
                  alt={item.book.title}
                  sx={{ objectFit: 'cover' }}
                  onError={(event) => {
                    event.currentTarget.src = '/book-placeholder.svg';
                  }}
                />

                <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography gutterBottom variant="subtitle1" noWrap>
                    {item.book.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.book.author}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      width: '100%',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <Chip
                      label={item.book.category || 'Uncategorized'}
                      size="small"
                      variant="outlined"
                      sx={{
                        minWidth: 0,
                        maxWidth: '100%',
                        height: 'auto',
                        '& .MuiChip-label': {
                          display: 'block',
                          whiteSpace: 'normal',
                          overflowWrap: 'anywhere',
                          lineHeight: 1.2,
                          py: 0.5
                        }
                      }}
                    />
                    <Chip
                      label={statusChip.label}
                      size="small"
                      color={statusChip.color}
                      variant="outlined"
                      sx={{
                        minWidth: 0,
                        maxWidth: '100%',
                        height: 'auto',
                        '& .MuiChip-label': {
                          display: 'block',
                          whiteSpace: 'normal',
                          overflowWrap: 'anywhere',
                          lineHeight: 1.2,
                          py: 0.5
                        }
                      }}
                    />
                    {item.book.availableQuantity > 0 ? (
                      <Chip
                        label={`${item.book.availableQuantity} available`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{
                          minWidth: 0,
                          maxWidth: '100%',
                          height: 'auto',
                          '& .MuiChip-label': {
                            display: 'block',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            lineHeight: 1.2,
                            py: 0.5
                          }
                        }}
                      />
                    ) : (
                      <Chip
                        label="Out of stock"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{
                          minWidth: 0,
                          maxWidth: '100%',
                          height: 'auto',
                          '& .MuiChip-label': {
                            display: 'block',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            lineHeight: 1.2,
                            py: 0.5
                          }
                        }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                    flexWrap: 'nowrap'
                  }}
                >
                  <Button
                    size="small"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleBorrow(item.bookId)}
                    disabled={item.book.availableQuantity === 0 || isBorrowing || actionState.disabled}
                    sx={{
                      minWidth: 0,
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      textAlign: 'left'
                    }}
                  >
                    {actionState.label}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleRemove(item.bookId)}
                    disabled={removeFromWishlistMutation.isPending}
                    sx={{ minWidth: 0, maxWidth: '100%' }}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
              );
            })()
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Your wishlist is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add books to your wishlist to save them for later.
          </Typography>
        </Paper>
      )}

      {hasWishlistItems && data!.pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={data!.pagination.pages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </Box>
      )}
    </Box>
  );
};
