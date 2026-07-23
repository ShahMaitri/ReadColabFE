import {
  alpha,
  Box,
  Card,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useActiveBorrows, useReturnBook, useConfirmBorrow } from '../hooks/useBorrowReservation';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';

export const MyBooksPage = () => {
  const theme = useTheme();
  const { data: borrows = [], isLoading, error } = useActiveBorrows();
  const returnMutation = useReturnBook();
  const confirmMutation = useConfirmBorrow();
  const [selectedBorrow, setSelectedBorrow] = useState<string | null>(null);
  const [action, setAction] = useState<'confirm' | 'return' | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load your books: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  if (borrows.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No active borrows
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visit the Books section to borrow a book
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BORROWED':
        return 'success';
      case 'APPROVED':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'BORROWED':
        return 'Borrowed';
      case 'APPROVED':
        return 'Ready to Pick Up';
      case 'PENDING':
        return 'Pending Approval';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return status;
    }
  };

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate: string | undefined) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleActionClick = (borrowId: string, borrowAction: 'confirm' | 'return') => {
    setSelectedBorrow(borrowId);
    setAction(borrowAction);
  };

  const handleConfirm = async () => {
    if (!selectedBorrow || !action) return;

    try {
      if (action === 'confirm') {
        await confirmMutation.mutateAsync(selectedBorrow);
      } else if (action === 'return') {
        await returnMutation.mutateAsync(selectedBorrow);
      }
      setSelectedBorrow(null);
      setAction(null);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

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
          My Books
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track active borrows, due dates, and quick return actions.
        </Typography>
      </Paper>

      <TableContainer component={Card} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
        <Table
          sx={{
            '& tbody .MuiTableCell-root': {
              py: 1.8
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Book Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {borrows.map((borrow) => {
              const overdue = isOverdue(borrow.dueDate);
              const daysLeft = getDaysRemaining(borrow.dueDate);

              return (
                <TableRow key={borrow.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {borrow.book?.title || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>{borrow.book?.author || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(borrow.status)}
                      color={getStatusColor(borrow.status) as any}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                      {borrow.status === 'BORROWED' && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: overdue ? '#d32f2f' : daysLeft! <= 3 ? '#f57c00' : '#388e3c',
                            fontWeight: 500,
                          }}
                        >
                          {overdue
                            ? 'Overdue'
                            : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {borrow.status === 'APPROVED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleActionClick(borrow.id, 'confirm')}
                          disabled={confirmMutation.isPending}
                        >
                          Pick Up
                        </Button>
                      )}
                      {borrow.status === 'BORROWED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleActionClick(borrow.id, 'return')}
                          disabled={returnMutation.isPending}
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

      {/* Action Confirmation Dialog */}
      <Dialog open={selectedBorrow !== null && action !== null} onClose={() => setSelectedBorrow(null)}>
        <DialogTitle>
          {action === 'confirm' ? 'Confirm Pick Up' : 'Confirm Return'}
        </DialogTitle>
        <DialogContent>
          {action === 'confirm'
            ? 'Are you sure you want to pick up this book?'
            : 'Are you sure you want to return this book?'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBorrow(null)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={confirmMutation.isPending || returnMutation.isPending}
          >
            {confirmMutation.isPending || returnMutation.isPending ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
