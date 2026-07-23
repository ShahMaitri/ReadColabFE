import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  alpha,
  Paper,
  Button,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  usePendingRequests,
  useApproveBorrowRequest,
  useRejectBorrowRequest,
} from '../hooks/usePersonalBooks';
import type { BorrowRequestWithDetails } from '../api/personalBook.api';
import { RequestDialog } from '../components/personalBooks';

export const PendingRequestsPage: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequestWithDetails | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const theme = useTheme();
  const { data: requests, isLoading } = usePendingRequests();
  const { mutate: approveBorrow, isPending: isApproving } = useApproveBorrowRequest();
  const { mutate: rejectBorrow, isPending: isRejecting } = useRejectBorrowRequest();

  const handleOpenRequest = (request: BorrowRequestWithDetails) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const handleApprove = (request: BorrowRequestWithDetails) => {
    approveBorrow(request.id, {
      onSuccess: () => {
        alert('Request approved successfully!');
        setRequestDialogOpen(false);
      },
      onError: (error: any) => {
        alert(error.response?.data?.message || 'Failed to approve request');
      },
    });
  };

  const handleOpenRejectDialog = (request: BorrowRequestWithDetails) => {
    setSelectedRequest(request);
    setRejectRemarks('');
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectBorrow(
        { requestId: selectedRequest.id, remarks: rejectRemarks },
        {
          onSuccess: () => {
            alert('Request rejected successfully!');
            setRejectDialogOpen(false);
            setRejectRemarks('');
            setSelectedRequest(null);
          },
          onError: (error: any) => {
            alert(error.response?.data?.message || 'Failed to reject request');
          },
        }
      );
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const pendingRequests = requests?.filter((r) => r.status === 'PENDING') || [];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Card elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`, background: theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)` : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.28)} 0%, ${alpha('#ffffff', 0.96)} 100%)` }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            Manage Borrow Requests
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
            Review and respond to requests from your colleagues
          </Typography>
        </Box>
      </Card>

      {/* Summary Cards */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {pendingRequests.length}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Pending Requests
          </Typography>
        </CardContent>
      </Card>

      {/* Requests Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !requests || pendingRequests.length === 0 ? (
        <Alert severity="info">
          You have no pending borrow requests. Your colleagues can request books from you once you've
          shared them in your personal library.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ fontWeight: 600 }}>Requester</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Requested On</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Book Condition</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.requester.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {request.requester.email}
                      </Typography>
                    </Box>
                  </TableCell>
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
                  <TableCell>{formatDate(request.requestDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.book.condition}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color="info"
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRequest(request)}
                          sx={{ border: 1, borderColor: 'divider' }}
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(request)}
                            disabled={isApproving}
                            sx={{
                              border: 1,
                              borderColor: 'success.main',
                              color: 'success.main',
                              '&:hover': { bgcolor: 'success.main', color: 'white' },
                            }}
                          >
                            <CheckOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRejectDialog(request)}
                            disabled={isRejecting}
                            sx={{
                              border: 1,
                              borderColor: 'error.main',
                              color: 'error.main',
                              '&:hover': { bgcolor: 'error.main', color: 'white' },
                            }}
                          >
                            <CloseOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <RequestDialog
          open={requestDialogOpen}
          request={selectedRequest}
          userRole="owner"
          onClose={() => setRequestDialogOpen(false)}
          onApprove={() => handleApprove(selectedRequest)}
          onReject={() => handleOpenRejectDialog(selectedRequest)}
          isLoading={isApproving || isRejecting}
        />
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
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
                Requester
              </Typography>
              <Typography variant="body2">{selectedRequest?.requester.name}</Typography>
            </Box>
            <TextField
              label="Reason for Rejection (Optional)"
              multiline
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Let them know why you're rejecting this request..."
              fullWidth
              disabled={isRejecting}
            />
            <Alert severity="info">
              The requester will be notified about the rejection.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={isRejecting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={isRejecting}
          >
            {isRejecting ? 'Processing...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
