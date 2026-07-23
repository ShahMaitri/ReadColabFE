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
import { useBook, useUploadCover, useGenerateQRCode, useRemoveCover } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import { useRequestBorrow, useReserveBook, useActiveBorrows, useUserReservations } from '../hooks/useBorrowReservation';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useNotification } from '../context/NotificationContext';
import { useState, useEffect } from 'react';
import { BookReviewSection } from '../components/reviews/BookReviewSection';
import { resolveCoverImageUrl } from '../utils/media';

export const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { data: book, isLoading, error } = useBook(id || '');
  const { mutate: uploadCover, isPending: isUploading } = useUploadCover();
  const { mutate: removeCover, isPending: isRemovingCover } = useRemoveCover();
  const { mutate: generateQRCode, data: qrData, isPending: isGenerating, error: qrError } = useGenerateQRCode();
  const { mutate: requestBorrow, isPending: isBorrowing } = useRequestBorrow();
  const { mutate: reserveBook, isPending: isReserving } = useReserveBook();
  const { data: activeBorrows = [] } = useActiveBorrows();
  const { data: userReservations = [], isLoading: isReservationsLoading } = useUserReservations();
  const { data: isInWishlist = false, isLoading: isWishlistLoading } = useIsInWishlist(id || '');
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } = useRemoveFromWishlist();
  const [showQRDialog, setShowQRDialog] = useState(false);

  // Auto-open QR dialog when QR code is generated
  useEffect(() => {
    if (qrData?.qrCode) {
      setShowQRDialog(true);
    }
  }, [qrData?.qrCode]);

  // Handle QR code generation errors
  useEffect(() => {
    if (qrError) {
      showNotification(
        (qrError as any)?.response?.data?.message || 'Failed to generate QR code',
        'error'
      );
    }
  }, [qrError, showNotification]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const currentBorrow = activeBorrows.find((borrow) => borrow.bookId === id);
  const currentBorrowStatus = currentBorrow?.status;
  const currentReservation = userReservations.find((reservation) => reservation.bookId === id);
  const currentReservationStatus = currentReservation?.status;
  const hasBlockingReservation =
    currentReservationStatus === 'PENDING' ||
    (currentReservationStatus === 'READY' && (book?.availableQuantity ?? 0) <= 0);

  const getBorrowButtonLabel = (): string => {
    switch (currentBorrowStatus) {
      case 'PENDING':
        return 'Borrow Requested';
      case 'APPROVED':
        return 'Borrow Approved';
      case 'BORROWED':
        return 'Already Borrowed';
      case 'OVERDUE':
        return 'Borrow Overdue';
      default:
        return 'Borrow Book';
    }
  };

  const getReservationButtonLabel = (): string => {
    switch (currentReservationStatus) {
      case 'PENDING':
        return 'Reservation Pending';
      case 'READY':
        return 'Reservation Ready';
      default:
        return 'Reserve Book';
    }
  };

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
      uploadCover(
        { id, file },
        {
          onSuccess: () => {
            showNotification('Book cover uploaded successfully!', 'success');
          },
          onError: (error: any) => {
            showNotification(
              error.response?.data?.message || 'Failed to upload book cover',
              'error'
            );
          }
        }
      );
    }

    // Allow selecting the same file again if needed.
    e.target.value = '';
  };

  const handleGenerateQR = () => {
    if (id) {
      generateQRCode(id, {
        onError: (error: any) => {
          showNotification(
            error?.response?.data?.message || 'Failed to generate QR code',
            'error'
          );
        }
      });
    }
  };

  const handleRemoveCover = () => {
    if (!id || !book.cover) return;

    if (!window.confirm('Remove this book cover?')) {
      return;
    }

    removeCover(id, {
      onSuccess: () => {
        showNotification('Book cover removed successfully!', 'success');
      },
      onError: (error: any) => {
        showNotification(
          error.response?.data?.message || 'Failed to remove book cover',
          'error'
        );
      }
    });
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
              image={resolveCoverImageUrl(book.cover)}
              alt={book.title}
              onError={(event) => {
                event.currentTarget.src = '/book-placeholder.svg';
              }}
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
                <Button
                  variant='outlined'
                  color='error'
                  fullWidth
                  onClick={handleRemoveCover}
                  disabled={!book.cover || isRemovingCover}
                >
                  Remove Cover
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
                    {currentBorrowStatus ? (
                      <Button
                        variant='contained'
                        color='primary'
                        startIcon={<ShoppingCartIcon />}
                        disabled
                        fullWidth
                      >
                        {getBorrowButtonLabel()}
                      </Button>
                    ) : hasBlockingReservation ? (
                      <Button
                        variant='outlined'
                        color='primary'
                        startIcon={<BookmarkIcon />}
                        disabled
                        fullWidth
                      >
                        {getReservationButtonLabel()}
                      </Button>
                    ) : book.availableQuantity > 0 ? (
                      <Button
                        variant='contained'
                        color='primary'
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleBorrow}
                        disabled={isBorrowing}
                        fullWidth
                      >
                        Borrow Book
                      </Button>
                    ) : (
                      <Button
                        variant='outlined'
                        color='primary'
                        startIcon={<BookmarkIcon />}
                        onClick={handleReserve}
                        disabled={isReserving || isReservationsLoading}
                        fullWidth
                      >
                        {isReservationsLoading ? 'Checking reservation...' : 'Reserve Book'}
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

        <BookReviewSection bookId={book.id} bookTitle={book.title} />
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
