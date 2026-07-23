import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useMyPersonalBooks, useCreatePersonalBook, useUpdatePersonalBook, useDeletePersonalBook } from '../hooks/usePersonalBooks';
import type { CreatePersonalBookPayload, PersonalBookData } from '../api/personalBook.api';
import { AvailabilityBadge, ConditionBadge } from '../components/personalBooks';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export const MyPersonalBooksPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<PersonalBookData | null>(null);
  const [formData, setFormData] = useState<CreatePersonalBookPayload>({
    title: '',
    author: '',
    condition: 'GOOD',
  });

  const theme = useTheme();
  const { data: booksData, isLoading } = useMyPersonalBooks();
  const { mutate: createBook, isPending: isCreating } = useCreatePersonalBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdatePersonalBook();
  const { mutate: deleteBook, isPending: isDeleting } = useDeletePersonalBook();

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      author: '',
      condition: 'GOOD',
    });
    setEditingBook(null);
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (book: PersonalBookData) => {
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      category: book.category,
      description: book.description,
      condition: book.condition as any,
      language: book.language,
      edition: book.edition,
      location: book.location,
    });
    setEditingBook(book);
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditingBook(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.author) {
      alert('Please fill in title and author');
      return;
    }

    if (editingBook) {
      updateBook({ id: editingBook.id, data: formData }, {
        onSuccess: () => {
          alert('Book updated successfully!');
          handleCloseDialog();
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to update book');
        },
      });
    } else {
      createBook(formData, {
        onSuccess: () => {
          alert('Book created successfully!');
          handleCloseDialog();
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to create book');
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(id, {
        onSuccess: () => {
          alert('Book deleted successfully!');
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to delete book');
        },
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Card elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`, background: theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)` : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.28)} 0%, ${alpha('#ffffff', 0.96)} 100%)` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
              My Personal Library
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
              Manage and share your book collection
            </Typography>
          </Box>
          <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Add Book
          </Button>
        </Stack>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {booksData?.data?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Books Shared
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Books Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !booksData?.data || booksData.data.length === 0 ? (
        <Alert severity="info">
          You haven't added any books yet. Start by adding your first book!
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Visibility</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {booksData.data.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {book.title}
                      </Typography>
                      {book.isbn && (
                        <Typography variant="caption" color="textSecondary">
                          ISBN: {book.isbn}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <ConditionBadge condition={book.condition} size="small" />
                  </TableCell>
                  <TableCell>
                    <AvailabilityBadge status={book.availabilityStatus} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={book.visibility}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(book)}
                        disabled={isUpdating}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(book.id)}
                        disabled={isDeleting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBook ? 'Edit Book' : 'Add New Book to Your Library'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Title *"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="Author *"
              fullWidth
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="Publisher"
              fullWidth
              value={formData.publisher || ''}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="ISBN"
              fullWidth
              value={formData.isbn || ''}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="Category"
              fullWidth
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <FormControl fullWidth disabled={isCreating || isUpdating}>
              <InputLabel>Condition *</InputLabel>
              <Select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                label="Condition *"
              >
                <MenuItem value="NEW">New</MenuItem>
                <MenuItem value="EXCELLENT">Excellent</MenuItem>
                <MenuItem value="GOOD">Good</MenuItem>
                <MenuItem value="FAIR">Fair</MenuItem>
                <MenuItem value="OLD">Old</MenuItem>
                <MenuItem value="DAMAGED">Damaged</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Language"
              fullWidth
              value={formData.language || ''}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="Edition"
              fullWidth
              value={formData.edition || ''}
              onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <TextField
              label="Location"
              fullWidth
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={isCreating || isUpdating}
            />
            <FormControl fullWidth disabled={isCreating || isUpdating}>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility || 'VISIBLE_TO_EVERYONE'}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                label="Visibility"
              >
                <MenuItem value="VISIBLE_TO_EVERYONE">Visible to Everyone</MenuItem>
                <MenuItem value="VISIBLE_TO_DEPARTMENT">Visible to Department</MenuItem>
                <MenuItem value="HIDDEN">Hidden</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isCreating || isUpdating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Saving...' : editingBook ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
