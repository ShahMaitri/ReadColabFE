import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useBooks, useCategories, useDeleteBook } from '../hooks/useBooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';

const WishlistAction = ({ bookId }: { bookId: string }) => {
  const { data: isInWishlist = false, isLoading } = useIsInWishlist(bookId);
  const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

  const handleToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(bookId);
      return;
    }

    addToWishlist(bookId);
  };

  return (
    <Button
      size='small'
      variant={isInWishlist ? 'contained' : 'outlined'}
      color='secondary'
      startIcon={<BookmarkIcon />}
      onClick={handleToggle}
      disabled={isAdding || isRemoving}
    >
      {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
    </Button>
  );
};

export const BooksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error } = useBooks(
    page + 1,
    rowsPerPage,
    search || undefined,
    category || undefined,
    sortBy,
    sortOrder
  );

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(id);
    }
  };

  const formatPublicationDate = (publicationDate?: string) => {
    if (!publicationDate) {
      return '-';
    }

    const date = new Date(publicationDate);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Books Library</h1>
          {isAdmin && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => navigate('/books/create')}
            >
              Add Book
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label='Search by title, author, or description'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size='small'
                placeholder='Type to search...'
              />
              <FormControl sx={{ minWidth: 150 }} size='small'>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label='Category'
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value=''>All Categories</MenuItem>
                  {categoriesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : (
                    categories?.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }} size='small'>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label='Sort By'
                  onChange={(e) =>
                    setSortBy(e.target.value as 'title' | 'author' | 'createdAt')
                  }
                >
                  <MenuItem value='createdAt'>Date Added</MenuItem>
                  <MenuItem value='title'>Title</MenuItem>
                  <MenuItem value='author'>Author</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }} size='small'>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label='Order'
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value='desc'>Descending</MenuItem>
                  <MenuItem value='asc'>Ascending</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Card>

        {/* Table */}
        {error && (
          <Alert severity='error'>Failed to load books. Please try again.</Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Publication Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align='center' sx={{ fontWeight: 600 }}>
                      Total
                    </TableCell>
                    <TableCell align='center' sx={{ fontWeight: 600 }}>
                      Available
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    {!isAdmin && <TableCell align='center' sx={{ fontWeight: 600 }}>Wishlist</TableCell>}
                    {isAdmin && <TableCell align='center' sx={{ fontWeight: 600 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data && data.data.length > 0 ? (
                    data.data.map((book) => (
                      <TableRow key={book.id} hover>
                        <TableCell>
                          <Box
                            onClick={() => navigate(`/books/${book.id}`)}
                            sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'none' }}
                          >
                            {book.title}
                          </Box>
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{formatPublicationDate(book.publicationDate)}</TableCell>
                        <TableCell>{book.category || '-'}</TableCell>
                        <TableCell align='center'>{book.quantity}</TableCell>
                        <TableCell align='center'>{book.availableQuantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={book.status}
                            size='small'
                            color={
                              book.status === 'AVAILABLE'
                                ? 'success'
                                : book.status === 'OUT_OF_STOCK'
                                  ? 'error'
                                  : 'default'
                            }
                            variant='outlined'
                          />
                        </TableCell>
                        {!isAdmin && (
                          <TableCell align='center'>
                            <WishlistAction bookId={book.id} />
                          </TableCell>
                        )}
                        {isAdmin && (
                          <TableCell align='center'>
                            <Stack direction='row' spacing={1} justifyContent='center'>
                              <Button
                                size='small'
                                variant='outlined'
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/books/${book.id}/edit`)}
                              >
                                Edit
                              </Button>
                              <Button
                                size='small'
                                variant='outlined'
                                color='error'
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(book.id)}
                                disabled={isDeleting}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 8} align='center' sx={{ py: 4 }}>
                        No books found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component='div'
              count={data?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        )}
      </Stack>
    </Box>
  );
};
