import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  alpha,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import { useMyBorrowedBooks, useMarkAsReturned } from '../hooks/usePersonalBooks';
import type { BorrowRequestWithDetails } from '../api/personalBook.api';
import { AvailabilityBadge } from '../components/personalBooks';
import { RequestDialog } from '../components/personalBooks';

export const MyBorrowedBooksPage: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequestWithDetails | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnRemarks, setReturnRemarks] = useState('');

  const theme = useTheme();
  const { data: requests, isLoading } = useMyBorrowedBooks();
  const { mutate: markAsReturned, isPending: isReturning } = useMarkAsReturned();

  const handleOpenRequest = (request: BorrowRequestWithDetails) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const handleOpenReturnDialog = (request: BorrowRequestWithDetails) => {
    setSelectedRequest(request);
    setReturnRemarks('');
    setReturnDialogOpen(true);
  };

  const handleMarkReturned = () => {
    if (selectedRequest) {
      markAsReturned(
        { requestId: selectedRequest.id, remarks: returnRemarks },
        {
          onSuccess: () => {
            alert('Book marked as returned successfully!');
            setReturnDialogOpen(false);
            setReturnRemarks('');
            setSelectedRequest(null);
          },
          onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to mark as returned');
          },
        }
      );
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const daysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const allRequests = requests || [];
  const pendingRequests = allRequests.filter((r) => r.status === 'PENDING');
  const borrowedBooks = allRequests.filter((r) => r.status === 'BORROWED');
  const activeLoans = borrowedBooks.length;
  const overdueBooks = borrowedBooks.filter((r) => isOverdue(r.dueDate)).length;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Card elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`, background: theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)` : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.28)} 0%, ${alpha('#ffffff', 0.96)} 100%)` }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            My Book Requests
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
            Track all your borrow requests and active loans
          </Typography>
        </Box>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {pendingRequests.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {activeLoans}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Loans
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{ color: overdueBooks > 0 ? 'error.main' : 'success.main' }}
              >
                {overdueBooks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Books Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : allRequests.length === 0 ? (
        <Alert severity="info">
          You haven't made any borrow requests yet. Browse and request books from your colleagues!
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Requested Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allRequests.map((request) => {
                const daysLeft = daysUntilDue(request.dueDate);
                const overdue = isOverdue(request.dueDate);
                const isBorrowed = request.status === 'BORROWED';

                const statusColor: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
                  PENDING: 'warning',
                  APPROVED: 'info',
                  BORROWED: 'success',
                  RETURNED: 'default',
                  REJECTED: 'error',
                  OVERDUE: 'error',
                };

                return (
                  <TableRow
                    key={request.id}
                    hover
                    sx={{ bgcolor: overdue && isBorrowed ? 'error.lighter' : undefined }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {request.book.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          by {request.book.author}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{request.owner.name}</TableCell>
                    <TableCell>{formatDate(request.requestDate || request.createdAt)}</TableCell>
                    <TableCell>
                      {request.dueDate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ color: overdue && isBorrowed ? 'error.main' : 'inherit', fontWeight: overdue && isBorrowed ? 600 : 400 }}
                          >
                            {formatDate(request.dueDate)}
                          </Typography>
                          {isBorrowed && daysLeft !== null && (
                            <Chip
                              label={overdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft}d left`}
                              color={overdue ? 'error' : daysLeft <= 3 ? 'warning' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={statusColor[request.status] || 'default'}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleOpenRequest(request)}>
                          View Details
                        </Button>
                        {isBorrowed && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenReturnDialog(request)}
                            disabled={isReturning}
                          >
                            Return
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <RequestDialog
          open={requestDialogOpen}
          request={selectedRequest}
          userRole="requester"
          onClose={() => setRequestDialogOpen(false)}
          onReturn={() => handleOpenReturnDialog(selectedRequest)}
        />
      )}

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Return Book</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Book
              </Typography>
              <Typography variant="body2">{selectedRequest?.book.title}</Typography>
              <Typography variant="caption" color="textSecondary">
                by {selectedRequest?.book.author}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Owner
              </Typography>
              <Typography variant="body2">{selectedRequest?.owner.name}</Typography>
            </Box>
            <TextField
              label="Return Notes (Optional)"
              multiline
              rows={3}
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="Any issues or notes about the condition..."
              fullWidth
              disabled={isReturning}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)} disabled={isReturning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkReturned}
            disabled={isReturning}
          >
            {isReturning ? 'Processing...' : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
