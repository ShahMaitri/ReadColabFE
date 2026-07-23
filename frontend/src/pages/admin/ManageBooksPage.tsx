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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAdminBooks, useUpdateBook, useDeleteBook } from '../../hooks/useAdmin';

export const ManageBooksPage = () => {
  const [page, setPage] = useState(1);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const { data, isLoading, error } = useAdminBooks(page, 10);
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, book: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBook(null);
  };

  const handleEditClick = (book: any) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditStatus(book.status);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (editingBook) {
      try {
        await updateBookMutation.mutateAsync({
          bookId: editingBook.id,
          updates: {
            title: editTitle,
            status: editStatus
          }
        });
        setEditingBook(null);
      } catch (err) {
        console.error('Failed to update book:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedBook) {
      if (confirm('Are you sure you want to delete this book?')) {
        try {
          await deleteBookMutation.mutateAsync(selectedBook.id);
        } catch (err) {
          console.error('Failed to delete book:', err);
        }
      }
    }
    handleMenuClose();
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
        <Alert severity="error">Failed to load books</Alert>
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
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' spacing={1.5}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Manage Books
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
              Edit inventory metadata, statuses, and lifecycle actions.
            </Typography>
          </Box>
          <Stack direction='row' spacing={1.25} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
            <Chip label={`${data?.total || 0} records`} variant='outlined' />
            <Button
              component={RouterLink}
              to='/books/create'
              variant='contained'
              size='small'
            >
              Add Book
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((book: any) => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.category || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      variant='outlined'
                      color={book.status === 'AVAILABLE' ? 'success' : book.status === 'OUT_OF_STOCK' ? 'error' : 'default'}
                      label={book.status}
                    />
                  </TableCell>
                  <TableCell>{book.quantity}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, book)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={selectedBook?.id === book.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleEditClick(book)}>Edit</MenuItem>
                      <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                    No books found
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    No inventory records are available for this page.
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

      {/* Edit Dialog */}
      <Dialog open={!!editingBook} onClose={() => setEditingBook(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Status"
            select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            margin="normal"
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingBook(null)}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={updateBookMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
