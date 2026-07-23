import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useBook, useUploadCover, useGenerateQRCode } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import { useRequestBorrow, useReserveBook, useActiveBorrows } from '../hooks/useBorrowReservation';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useNotification } from '../context/NotificationContext';
import { useState } from 'react';

export const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { data: book, isLoading, error } = useBook(id || '');
  const { mutate: uploadCover, isPending: isUploading } = useUploadCover();
  const { mutate: generateQRCode, data: qrData, isPending: isGenerating } = useGenerateQRCode();
  const { mutate: requestBorrow, isPending: isBorrowing } = useRequestBorrow();
  const { mutate: reserveBook, isPending: isReserving } = useReserveBook();
  const { data: activeBorrows = [] } = useActiveBorrows();
  const { data: isInWishlist = false, isLoading: isWishlistLoading } = useIsInWishlist(id || '');
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } = useRemoveFromWishlist();
  const [showQRDialog, setShowQRDialog] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Check if user already has this book borrowed
  const hasActiveBorrow = activeBorrows.some((borrow) => borrow.bookId === id);

  const handleBorrow = () => {
    if (!id) return;
    requestBorrow(id, {
      onSuccess: () => {
        showNotification('Borrow request submitted successfully!', 'success');
      },
      onError: (error: any) => {
        showNotification(
          error.response?.data?.message || 'Failed to request borrow',
          'error'
        );
      },
    });
  };

  const handleReserve = () => {
    if (!id) return;
    reserveBook(id, {
      onSuccess: () => {
        showNotification('Book reserved successfully!', 'success');
      },
      onError: (error: any) => {
        showNotification(
          error.response?.data?.message || 'Failed to reserve book',
          'error'
        );
      },
    });
  };

  const handleWishlistToggle = () => {
    if (!id) return;

    if (isInWishlist) {
      removeFromWishlist(id, {
        onSuccess: () => {
          showNotification('Removed from wishlist', 'success');
        },
        onError: (error: any) => {
          showNotification(
            error.response?.data?.message || 'Failed to remove from wishlist',
            'error'
          );
        }
      });
      return;
    }

    addToWishlist(id, {
      onSuccess: () => {
        showNotification('Added to wishlist', 'success');
      },
      onError: (error: any) => {
        showNotification(
          error.response?.data?.message || 'Failed to add to wishlist',
          'error'
        );
      }
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/books')}
          sx={{ mb: 2 }}
        >
          Back to Books
        </Button>
        <Alert severity='error'>Failed to load book details</Alert>
      </Box>
    );
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      uploadCover({ id, file });
    }
  };

  const handleGenerateQR = () => {
    if (id) {
      generateQRCode(id);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/books')}
        sx={{ mb: 2 }}
      >
        Back to Books
      </Button>

      <Stack spacing={3}>
        {/* Main Content */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Cover Image */}
          <Card sx={{ width: { xs: '100%', md: 300 } }}>
            <CardMedia
              component='img'
              height='400'
              image={book.cover || 'https://via.placeholder.com/300x400?text=No+Cover'}
              alt={book.title}
            />
            {isAdmin && (
              <Stack sx={{ p: 2 }} spacing={1}>
                <Button variant='contained' component='label' fullWidth>
                  Upload Cover
                  <input
                    hidden
                    accept='image/*'
                    type='file'
                    onChange={handleCoverUpload}
                    disabled={isUploading}
                  />
                </Button>
              </Stack>
            )}
          </Card>

          {/* Details */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant='h4' gutterBottom>
                      {book.title}
                    </Typography>
                    <Typography variant='h6' color='text.secondary'>
                      by {book.author}
                    </Typography>
                  </Box>
                  {isAdmin && (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/books/${book.id}/edit`)}
                      variant='outlined'
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 2 }}>
                  {book.isbn && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        ISBN
                      </Typography>
                      <Typography variant='body2'>{book.isbn}</Typography>
                    </Box>
                  )}
                  {book.category && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Category
                      </Typography>
                      <Typography variant='body2'>{book.category}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Total Copies
                    </Typography>
                    <Typography variant='body2'>{book.quantity}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Available
                    </Typography>
                    <Typography variant='body2'>{book.availableQuantity}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Status
                    </Typography>
                    <Typography variant='body2'>{book.status}</Typography>
                  </Box>
                  {book.publicationDate && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Published
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(book.publicationDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {book.description && (
                  <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
                    <Typography variant='h6' gutterBottom>
                      Description
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {book.description}
                    </Typography>
                  </Box>
                )}

                {isAdmin && (
                  <Button
                    startIcon={<QrCodeIcon />}
                    onClick={handleGenerateQR}
                    variant='outlined'
                    disabled={isGenerating}
                    sx={{ mt: 2 }}
                  >
                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                )}

                {!isAdmin && user && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    {book.availableQuantity > 0 ? (
                      <Button
                        variant='contained'
                        color='primary'
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleBorrow}
                        disabled={isBorrowing || hasActiveBorrow}
                        fullWidth
                      >
                        {hasActiveBorrow ? 'Already Borrowed' : 'Borrow Book'}
                      </Button>
                    ) : (
                      <Button
                        variant='outlined'
                        color='primary'
                        startIcon={<BookmarkIcon />}
                        onClick={handleReserve}
                        disabled={isReserving}
                        fullWidth
                      >
                        Reserve Book
                      </Button>
                    )}
                    <Button
                      variant={isInWishlist ? 'outlined' : 'contained'}
                      color='secondary'
                      startIcon={<BookmarkIcon />}
                      onClick={handleWishlistToggle}
                      disabled={isWishlistLoading || isAddingToWishlist || isRemovingFromWishlist}
                      fullWidth
                    >
                      {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)} maxWidth='sm'>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          {qrData?.qrCode ? (
            <Box
              component='img'
              src={qrData.qrCode}
              alt='QR Code'
              sx={{ width: '100%', mt: 2 }}
            />
          ) : (
            <Typography>QR Code not generated yet</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
          {qrData?.qrCode && (
            <Button
              component='a'
              href={qrData.qrCode}
              download={`qr-code-${book.id}.png`}
              variant='contained'
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
