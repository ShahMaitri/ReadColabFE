import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import type { BorrowRequestWithDetails } from '../../api/personalBook.api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';

interface RequestDialogProps {
  open: boolean;
  request: BorrowRequestWithDetails | null;
  userRole: 'owner' | 'requester';
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onReturn?: () => void;
  isLoading?: boolean;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  PENDING: 'info',
  APPROVED: 'warning',
  REJECTED: 'error',
  BORROWED: 'warning',
  RETURNED: 'success',
  OVERDUE: 'error',
};

export const RequestDialog: React.FC<RequestDialogProps> = ({
  open,
  request,
  userRole,
  onClose,
  onApprove,
  onReject,
  onReturn,
  isLoading = false,
}) => {
  if (!request) return null;

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Borrow Request - {request.book.title}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {/* Book Details */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Book
              </Typography>
              <Typography variant="body2">{request.book.title}</Typography>
              <Typography variant="caption" color="textSecondary">
                by {request.book.author}
              </Typography>
            </CardContent>
          </Card>

          {/* Request Status */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <Chip
              label={request.status}
              color={statusColors[request.status] as any}
              icon={
                request.status === 'RETURNED' ? (
                  <CheckCircleIcon />
                ) : request.status === 'REJECTED' ? (
                  <CancelIcon />
                ) : request.status === 'OVERDUE' ? (
                  <BlockIcon />
                ) : undefined
              }
            />
          </Box>

          {/* Timeline */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Timeline
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <Typography variant="body2" color="textSecondary">
                  Requested:
                </Typography>
                <Typography variant="body2">{formatDate(request.requestDate)}</Typography>
              </Box>
              {request.approvedDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <Typography variant="body2" color="textSecondary">
                    Approved:
                  </Typography>
                  <Typography variant="body2">{formatDate(request.approvedDate)}</Typography>
                </Box>
              )}
              {request.borrowDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <Typography variant="body2" color="textSecondary">
                    Borrowed:
                  </Typography>
                  <Typography variant="body2">{formatDate(request.borrowDate)}</Typography>
                </Box>
              )}
              {request.dueDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <Typography variant="body2" color="textSecondary">
                    Due:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        new Date(request.dueDate) < new Date()
                          ? 'error.main'
                          : 'inherit',
                    }}
                  >
                    {formatDate(request.dueDate)}
                  </Typography>
                </Box>
              )}
              {request.returnDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <Typography variant="body2" color="textSecondary">
                    Returned:
                  </Typography>
                  <Typography variant="body2">{formatDate(request.returnDate)}</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Requester/Owner Info */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {userRole === 'owner' ? 'Requester' : 'Owner'}
            </Typography>
            <Typography variant="body2">
              {userRole === 'owner' ? request.requester.name : request.owner.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {userRole === 'owner' ? request.requester.email : request.owner.email}
            </Typography>
          </Box>

          {/* Remarks */}
          {request.remarks && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Remarks
              </Typography>
              <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                {request.remarks}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
        {userRole === 'owner' && request.status === 'PENDING' && (
          <>
            <Button
              onClick={onReject}
              color="error"
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button
              onClick={onApprove}
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Approve'}
            </Button>
          </>
        )}
        {userRole === 'requester' && request.status === 'BORROWED' && (
          <Button
            onClick={onReturn}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Mark as Returned'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
