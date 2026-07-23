import {
  alpha,
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
  Chip,
  Stack
} from '@mui/material';
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  useAdminBorrows,
  useApproveBorrow,
  useRejectBorrow,
  useMarkBorrowed,
  useReturnBorrow
} from '../../hooks/useAdmin';

export const ManageBorrowsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, error } = useAdminBorrows(page, 10, statusFilter);
  const approveMutation = useApproveBorrow();
  const rejectMutation = useRejectBorrow();
  const markBorrowedMutation = useMarkBorrowed();
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
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, 0.24)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`
              : `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.24)} 0%, ${alpha('#ffffff', 0.97)} 100%)`
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Borrow Requests
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
              Approve, reject, and complete lending workflows from a single queue.
            </Typography>
          </Box>
          <Box sx={{ ml: { md: 'auto' }, width: { xs: '100%', md: 'auto' }, alignSelf: { xs: 'stretch', md: 'center' } }}>
            <FormControl sx={{ minWidth: 220, width: { xs: '100%', md: 220 } }}>
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
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: '12px', border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}` }}
      >
        <TableContainer>
          <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Borrow Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((borrow: any) => (
                <TableRow key={borrow.id} hover sx={{ '& > td': { py: 1.5 } }}>
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
                  <TableCell align="center">
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {borrow.status === 'PENDING' && (
                        <Stack direction='row' spacing={1} justifyContent='center'>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ minWidth: 0, px: 1 }}
                            onClick={() => approveMutation.mutate(borrow.id)}
                            disabled={approveMutation.isPending}
                            aria-label="Approve borrow"
                          >
                            <CheckIcon fontSize="small" />
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ minWidth: 0, px: 1 }}
                            onClick={() => rejectMutation.mutate(borrow.id)}
                            disabled={rejectMutation.isPending}
                            aria-label="Reject borrow"
                          >
                            <CloseIcon fontSize="small" />
                          </Button>
                        </Stack>
                      )}
                      {borrow.status === 'APPROVED' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{ whiteSpace: 'nowrap' }}
                          onClick={() => markBorrowedMutation.mutate(borrow.id)}
                          disabled={markBorrowedMutation.isPending}
                        >
                          Mark as Borrowed
                        </Button>
                      )}
                      {borrow.status === 'BORROWED' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ whiteSpace: 'nowrap' }}
                          onClick={() => returnMutation.mutate(borrow.id)}
                          disabled={returnMutation.isPending}
                        >
                          Mark as Returned
                        </Button>
                      )}
                      {borrow.status === 'RETURNED' && (
                        <Typography variant="caption" color="textSecondary">
                          Completed
                        </Typography>
                      )}
                      {borrow.status === 'REJECTED' && (
                        <Typography variant="caption" color="error.main">
                          Completed
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    No borrow requests found
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Try switching status filters or check back later.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>

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
