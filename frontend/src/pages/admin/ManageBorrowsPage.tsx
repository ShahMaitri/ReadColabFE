import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { useState } from 'react';
import {
  useAdminBorrows,
  useApproveBorrow,
  useRejectBorrow,
  useReturnBorrow
} from '../../hooks/useAdmin';

export const ManageBorrowsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, error } = useAdminBorrows(page, 10, statusFilter);
  const approveMutation = useApproveBorrow();
  const rejectMutation = useRejectBorrow();
  const returnMutation = useReturnBorrow();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'BORROWED':
        return 'primary';
      case 'RETURNED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
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
        <Alert severity="error">Failed to load borrow requests</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Borrow Requests
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
            label="Filter by Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="BORROWED">Borrowed</MenuItem>
            <MenuItem value="RETURNED">Returned</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Borrow Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((borrow: any) => (
                <TableRow key={borrow.id} hover>
                  <TableCell>{borrow.user?.name}</TableCell>
                  <TableCell>{borrow.book?.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={borrow.status}
                      color={getStatusColor(borrow.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {borrow.borrowDate
                      ? new Date(borrow.borrowDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {borrow.status === 'PENDING' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ mr: 1 }}
                          onClick={() => approveMutation.mutate(borrow.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => rejectMutation.mutate(borrow.id)}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {borrow.status === 'APPROVED' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => returnMutation.mutate(borrow.id)}
                        disabled={returnMutation.isPending}
                      >
                        Mark as Borrowed
                      </Button>
                    )}
                    {borrow.status === 'BORROWED' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => returnMutation.mutate(borrow.id)}
                        disabled={returnMutation.isPending}
                      >
                        Mark as Returned
                      </Button>
                    )}
                    {(borrow.status === 'RETURNED' || borrow.status === 'REJECTED') && (
                      <Typography variant="caption" color="textSecondary">
                        Completed
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No borrow requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data?.pagination && data.pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
