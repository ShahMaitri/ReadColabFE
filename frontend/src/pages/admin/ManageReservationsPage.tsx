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
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useState } from 'react';
import {
  useAdminReservations,
  useCancelReservation,
  useMarkReservationReady
} from '../../hooks/useAdmin';

export const ManageReservationsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, error } = useAdminReservations(page, 10, statusFilter);
  const cancelMutation = useCancelReservation();
  const readyMutation = useMarkReservationReady();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'READY':
        return 'success';
      case 'CANCELLED':
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
        <Alert severity="error">Failed to load reservations</Alert>
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
              Reservations
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
              Track queue positions and transition reservations to ready state.
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
                <MenuItem value="READY">Ready</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reserved Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((reservation: any) => (
                <TableRow key={reservation.id} hover>
                  <TableCell>{reservation.user?.name}</TableCell>
                  <TableCell>{reservation.book?.title}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={reservation.status}
                      color={getStatusColor(reservation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{reservation.position}</TableCell>
                  <TableCell>
                    {new Date(reservation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    {reservation.status === 'PENDING' && (
                      <Stack direction='row' spacing={1} justifyContent='center'>
                        <Tooltip title='Mark Ready'>
                          <span>
                            <IconButton
                              size='small'
                              color='success'
                              onClick={() => readyMutation.mutate(reservation.id)}
                              disabled={readyMutation.isPending}
                            >
                              <CheckIcon fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title='Cancel Reservation'>
                          <span>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => cancelMutation.mutate(reservation.id)}
                              disabled={cancelMutation.isPending}
                            >
                              <CancelOutlinedIcon fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    )}
                    {reservation.status === 'READY' && (
                      <Typography variant='caption' color='success.main' sx={{ fontWeight: 600 }}>
                        Ready
                      </Typography>
                    )}
                    {reservation.status === 'CANCELLED' && (
                      <Typography variant="caption" color="textSecondary">
                        Cancelled
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    No reservations found
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Reservation queue is clear for the selected filter.
                  </Typography>
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
