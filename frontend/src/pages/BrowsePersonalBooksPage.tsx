import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  TextField,
  Button,
  Stack,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Card,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSearchPersonalBooks, useRequestBook } from '../hooks/usePersonalBooks';
import { useGetPersonalBook } from '../hooks/usePersonalBooks';
import { PersonalBookCard, OwnerCard } from '../components/personalBooks';
import type { PersonalBookWithOwner } from '../api/personalBook.api';
import SearchIcon from '@mui/icons-material/Search';

export const BrowsePersonalBooksPage: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedBook, setSelectedBook] = useState<PersonalBookWithOwner | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const {
    data: booksData,
    isLoading,
    error,
  } = useSearchPersonalBooks(
    page,
    limit,
    search,
    author,
    category,
    condition,
    undefined,
    language,
    sortBy,
    sortOrder
  );

  const { mutate: requestBook, isPending: isRequesting } = useRequestBook();

  const handleSearch = () => {
    setPage(1);
  };

  const handleViewDetails = (book: PersonalBookWithOwner) => {
    setSelectedBook(book);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedBook(null);
  };

  const handleRequestBook = (bookId: string) => {
    requestBook(bookId, {
      onSuccess: () => {
        alert('Book request created successfully!');
      },
      onError: (error: any) => {
        alert(error.response?.data?.message || 'Failed to request book');
      },
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setAuthor('');
    setCategory('');
    setCondition('');
    setLanguage('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Card elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`, background: theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)` : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.28)} 0%, ${alpha('#ffffff', 0.96)} 100%)` }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            Browse Personal Library
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
            Discover and request books from your colleagues
          </Typography>
        </Box>
      </Card>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* Main Search */}
          <TextField
            fullWidth
            placeholder="Search by title, author, ISBN, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />

          {/* Filters Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Author"
                size="small"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Category"
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Condition</InputLabel>
                <Select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  label="Condition"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="NEW">New</MenuItem>
                  <MenuItem value="EXCELLENT">Excellent</MenuItem>
                  <MenuItem value="GOOD">Good</MenuItem>
                  <MenuItem value="FAIR">Fair</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Language"
                size="small"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Newest</MenuItem>
                  <MenuItem value="borrowCount">Popular</MenuItem>
                  <MenuItem value="averageRating">Rating</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  label="Order"
                >
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
            <Button
              variant="contained"
              onClick={handleSearch}
            >
              Search
            </Button>
          </Stack>

          {/* Active Filters Display */}
          {(search || author || category || condition || language) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {search && <Chip label={`Title: ${search}`} onDelete={() => setSearch('')} />}
              {author && <Chip label={`Author: ${author}`} onDelete={() => setAuthor('')} />}
              {category && <Chip label={`Category: ${category}`} onDelete={() => setCategory('')} />}
              {condition && <Chip label={`Condition: ${condition}`} onDelete={() => setCondition('')} />}
              {language && <Chip label={`Language: ${language}`} onDelete={() => setLanguage('')} />}
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load books. Please try again.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !booksData?.data || booksData.data.length === 0 ? (
        <Alert severity="info">
          No books found matching your criteria. Try adjusting your filters.
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Showing {booksData.data.length} of {booksData.pagination?.total || 0} books
          </Typography>

          {/* Books Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {booksData.data.map((book: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <PersonalBookCard
                  book={book}
                  onViewDetails={handleViewDetails}
                  onRequest={handleRequestBook}
                  isLoading={isRequesting}
                  showActions={true}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {booksData.pagination && booksData.pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination
                count={booksData.pagination.pages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Detail Dialog */}
      {selectedBook && (
        <Dialog open={detailDialogOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedBook.title}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={3}>
              {selectedBook.coverImage && (
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              )}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Author:</strong> {selectedBook.author}
                </Typography>
                {selectedBook.isbn && (
                  <Typography variant="body2" gutterBottom>
                    <strong>ISBN:</strong> {selectedBook.isbn}
                  </Typography>
                )}
                {selectedBook.publisher && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Publisher:</strong> {selectedBook.publisher}
                  </Typography>
                )}
                {selectedBook.description && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Description:</strong> {selectedBook.description}
                  </Typography>
                )}
              </Box>
              <OwnerCard profile={{
                id: selectedBook.owner.id,
                name: selectedBook.owner.name,
                email: selectedBook.owner.email,
                avatar: selectedBook.owner.avatar,
                booksShared: 0,
                booksBorrowed: 0,
                averageRating: selectedBook.averageRating,
                responseTime: 0,
                successfulLending: 0,
                memberSince: selectedBook.createdAt,
                verifiedBadge: true,
                successfulReturnPercentage: 0,
                lateReturnPercentage: 0,
              }} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetail}>Close</Button>
            {selectedBook.availabilityStatus === 'AVAILABLE' && (
              <Button
                variant="contained"
                onClick={() => {
                  handleRequestBook(selectedBook.id);
                  handleCloseDetail();
                }}
                disabled={isRequesting}
              >
                Request Book
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};
