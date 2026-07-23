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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Manage Books
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          book.status === 'AVAILABLE'
                            ? '#d4edda'
                            : book.status === 'OUT_OF_STOCK'
                              ? '#f8d7da'
                              : '#e2e3e5',
                        color:
                          book.status === 'AVAILABLE'
                            ? '#155724'
                            : book.status === 'OUT_OF_STOCK'
                              ? '#721c24'
                              : '#383d41'
                      }}
                    >
                      {book.status}
                    </Box>
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
                <TableCell colSpan={6} align="center">
                  No books found
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
