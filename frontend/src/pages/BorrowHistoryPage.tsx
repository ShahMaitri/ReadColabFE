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
  Typography,
  TablePagination,
  Paper,
} from '@mui/material';
import { useBorrowHistory } from '../hooks/useBorrowReservation';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';

export const BorrowHistoryPage = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useBorrowHistory(page + 1, limit);

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
        Failed to load borrow history: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RETURNED':
        return 'success';
      case 'BORROWED':
        return 'info';
      case 'APPROVED':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RETURNED':
        return 'Returned';
      case 'BORROWED':
        return 'Borrowed';
      case 'APPROVED':
        return 'Approved';
      case 'PENDING':
        return 'Pending';
      case 'OVERDUE':
        return 'Overdue';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
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
          Borrow History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete log of requests, approvals, borrows, and returns.
        </Typography>
      </Paper>

      {(!data?.data || data.data.length === 0) ? (
        <Alert severity="info">No borrow history found</Alert>
      ) : (
        <>
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
                  <TableCell>Borrow Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Return Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data!.data.map((borrow) => (
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
                      {borrow.borrowDate ? new Date(borrow.borrowDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {borrow.returnDate
                        ? new Date(borrow.returnDate).toLocaleDateString()
                        : 'Not yet returned'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={data!.total}
            rowsPerPage={limit}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
};
