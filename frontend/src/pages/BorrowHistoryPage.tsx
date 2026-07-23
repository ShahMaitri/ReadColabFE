import {
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
} from '@mui/material';
import { useBorrowHistory } from '../hooks/useBorrowReservation';
import { useState } from 'react';

export const BorrowHistoryPage = () => {
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
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Borrow History
      </Typography>

      {(!data?.data || data.data.length === 0) ? (
        <Alert severity="info">No borrow history found</Alert>
      ) : (
        <>
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
