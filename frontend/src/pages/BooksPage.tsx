import { useState, useMemo, useEffect } from 'react';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
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
  Chip,
  Typography,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useBooks, useCategories, useDeleteBook } from '../hooks/useBooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useTheme } from '@mui/material/styles';

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
      sx={{ minWidth: 36, px: 1 }}
      onClick={handleToggle}
      disabled={isLoading || isAdding || isRemoving}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <BookmarkIcon fontSize='small' />
    </Button>
  );
};

export const BooksPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
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
  const activeFiltersCount = [search.trim(), category].filter(Boolean).length;

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(urlSearch);
    setPage(0);
  }, [searchParams]);

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
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '12px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.28)} 0%, ${alpha('#ffffff', 0.96)} 100%)`
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', md: 'flex-start' }}
            spacing={2}
            sx={{ width: '100%' }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
                Books Library
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
                Discover, filter, and manage the collection with faster browsing controls.
              </Typography>
            </Box>
            <Stack
              direction='row'
              spacing={1}
              flexWrap='wrap'
              useFlexGap
              sx={{
                ml: { md: 'auto' },
                width: { xs: '100%', md: 'fit-content' },
                justifyContent: 'flex-end',
                alignSelf: { xs: 'flex-end', md: 'flex-start' }
              }}
            >
              <Chip
                size='small'
                variant='outlined'
                label={
                  <Stack spacing={0.15} sx={{ alignItems: 'center', py: 0.25 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                      {data?.total || 0}
                    </Typography>
                    <Typography variant='caption' sx={{ lineHeight: 1.1 }}>
                      Total Books
                    </Typography>
                  </Stack>
                }
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  height: 'auto',
                  '& .MuiChip-label': { px: 1.25, py: 0.35 }
                }}
              />
              <Chip
                size='small'
                color={activeFiltersCount > 0 ? 'primary' : 'default'}
                variant={activeFiltersCount > 0 ? 'filled' : 'outlined'}
                label={
                  <Stack spacing={0.15} sx={{ alignItems: 'center', py: 0.25 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                      {activeFiltersCount}
                    </Typography>
                    <Typography variant='caption' sx={{ lineHeight: 1.1 }}>
                      Active Filters
                    </Typography>
                  </Stack>
                }
                sx={{
                  height: 'auto',
                  '& .MuiChip-label': { px: 1.25, py: 0.35 }
                }}
              />
              {isAdmin && (
                <ButtonBase
                  onClick={() => navigate('/books/create')}
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    transition: 'transform 160ms ease, opacity 160ms ease',
                    '&:active': {
                      transform: 'scale(0.96)'
                    }
                  }}
                >
                  <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      <AddIcon fontSize='small' />
                    </Box>
                    <Typography variant='caption' sx={{ fontWeight: 600 }}>
                      Add Book
                    </Typography>
                  </Stack>
                </ButtonBase>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Filters */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '12px',
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`
          }}
        >
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  )
                }}
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
              <Button
                variant='text'
                color='inherit'
                startIcon={<RestartAltIcon />}
                disabled={!search && !category}
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setPage(0);
                }}
              >
                Reset
              </Button>
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
          <Card elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
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
                            sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600 }}
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
                                aria-label='Edit book'
                                onClick={() => navigate(`/books/${book.id}/edit`)}
                                sx={{ minWidth: 0, px: 1 }}
                              >
                                <EditIcon fontSize='small' />
                              </Button>
                              <Button
                                size='small'
                                variant='outlined'
                                color='error'
                                aria-label='Delete book'
                                onClick={() => handleDelete(book.id)}
                                disabled={isDeleting}
                                sx={{ minWidth: 0, px: 1 }}
                              >
                                <DeleteIcon fontSize='small' />
                              </Button>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 9} align='center' sx={{ py: 6 }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 0.5 }}>
                          No books found
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Try adjusting your search or filters to broaden results.
                        </Typography>
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
