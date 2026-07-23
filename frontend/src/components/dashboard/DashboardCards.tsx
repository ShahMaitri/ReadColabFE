import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination
} from '@mui/material';
import {
  LocalLibrary,
  TrendingUp,
  Schedule,
  Star,
  Favorite,
  History
} from '@mui/icons-material';
import {
  useAvailableBooks,
  useRecentlyAddedBooks,
  useTrendingBooks,
  useDueSoonBooks,
  useReadingStatistics,
  useRecentActivity,
  useUserBorrows,
  useRecommendedBooks
} from '../../hooks/useDashboard';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  useBorrowStatusDistribution,
  useDashboardStats,
  useGlobalDueSoonBorrows,
  useGlobalReadingStatistics,
  useGlobalWishlistCount
} from '../../hooks/useAnalytics';

export const BooksAvailableCard = () => {
  const { data: books = [], isLoading } = useAvailableBooks();
  const totalAvailable = Array.isArray(books) ? books.reduce((sum, book) => sum + (book.availableQuantity || 0), 0) : 0;
  const totalBooks = Array.isArray(books) ? books.length : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<LocalLibrary sx={{ color: 'primary.main' }} />}
        title="Books Available"
        subheader={totalBooks + ' Total Books'}
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {totalAvailable}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Copies available for borrowing
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const BooksBorrowedCard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const { data: borrows = [], isLoading } = useUserBorrows();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  const borrowedCount = isAdmin
    ? (dashboardStats?.totalBorrows ?? 0)
    : borrows.filter((b) => b.status === 'BORROWED').length;
  const loading = isAdmin ? statsLoading : isLoading;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<LocalLibrary sx={{ color: 'warning.main' }} />}
        title="Books Borrowed"
        subheader={isAdmin ? 'Total borrows by all users' : 'Your Current Borrows'}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {borrowedCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isAdmin ? 'Borrow records across all users' : 'Currently borrowed by you'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const OpenRequestsCard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const { data: borrows = [], isLoading } = useUserBorrows();
  const { data: borrowStatusDist = [], isLoading: statusDistLoading } = useBorrowStatusDistribution();

  const openRequestsCount = isAdmin
    ? (borrowStatusDist.find((item: any) => item.status === 'PENDING')?.count ?? 0)
    : borrows.filter((borrow) => borrow.status === 'PENDING').length;
  const loading = isAdmin ? statusDistLoading : isLoading;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Schedule sx={{ color: 'warning.main' }} />}
        title="Borrow Requests"
        subheader={isAdmin ? 'Pending requests from all users' : 'Your pending borrow requests'}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {openRequestsCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isAdmin ? 'Requests awaiting admin approval' : 'Awaiting admin approval'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const DueSoonCard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const { data: dueSoon = [], isLoading } = useDueSoonBooks();
  const { data: globalDueSoon = [], isLoading: globalDueSoonLoading } = useGlobalDueSoonBorrows(7);
  const data = isAdmin ? globalDueSoon : dueSoon;
  const loading = isAdmin ? globalDueSoonLoading : isLoading;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Schedule sx={{ color: 'error.main' }} />}
        title="Due Soon"
        subheader={isAdmin ? 'All users: books due in 7 days' : 'Books due in 7 days'}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : data.length > 0 ? (
          <Box>
            <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
              {data.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isAdmin ? 'Borrowed books due soon across users' : 'Books to return soon'}
            </Typography>
            <List sx={{ mt: 1 }}>
              {data.slice(0, 3).map((book, idx) => (
                <ListItem key={idx} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={<Typography variant="caption">{book.book?.title || 'Unknown book'}</Typography>}
                    secondary={<Typography variant="caption">Due: {new Date(book.dueDate).toLocaleDateString()}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No books due soon
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const RecommendedBooksCard = () => {
  const { data: recommended = [], isLoading } = useRecommendedBooks();
  const displayBooks = Array.isArray(recommended) ? recommended : [];
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(displayBooks.length / rowsPerPage));
  const pagedBooks = displayBooks.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Star sx={{ color: 'info.main' }} />}
        title="Recommended Books"
        subheader="Personalized for you"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : displayBooks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recommendations available right now.
          </Typography>
        ) : (
          <Box>
            <TableContainer>
              <Table size="small" aria-label="recommended books table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56 }}>#</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedBooks.map((book, idx) => (
                    <TableRow key={`${book.title}-${book.author}-${idx}`} hover>
                      <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {book.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{book.author}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  size="small"
                  count={totalPages}
                  page={page}
                  onChange={(_event, value) => setPage(value)}
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentlyAddedCard = () => {
  const { data: recentBooks = [], isLoading } = useRecentlyAddedBooks();
  const displayBooks = Array.isArray(recentBooks) ? recentBooks : [];
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(displayBooks.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedBooks = displayBooks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<TrendingUp sx={{ color: 'success.main' }} />}
        title="Recently Added"
        subheader="Latest in our library"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : displayBooks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recently added books available.
          </Typography>
        ) : (
          <Box>
            <TableContainer>
              <Table size="small" aria-label="recently added books table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56 }}>#</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedBooks.map((book, idx) => (
                    <TableRow key={`${book.id || book.title}-${idx}`} hover>
                      <TableCell>{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {book.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{book.author}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={book.category || 'General'} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_event, value) => setPage(value)}
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const TrendingBooksCard = () => {
  const { data: trending = [], isLoading } = useTrendingBooks();
  const displayBooks = Array.isArray(trending) ? trending : [];
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(displayBooks.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedBooks = displayBooks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<TrendingUp sx={{ color: 'warning.main' }} />}
        title="Trending Books"
        subheader="Most borrowed this week"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : displayBooks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No trending books available.
          </Typography>
        ) : (
          <Box>
            <TableContainer>
              <Table size="small" aria-label="trending books table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56 }}>#</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedBooks.map((book, idx) => (
                    <TableRow key={`${book.id || book.title}-${idx}`} hover>
                      <TableCell>{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {book.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{book.author}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_event, value) => setPage(value)}
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const ReadingStatisticsCard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const { data: userStats, isLoading: userStatsLoading } = useReadingStatistics();
  const { data: globalStats, isLoading: globalStatsLoading } = useGlobalReadingStatistics();
  const stats = isAdmin ? globalStats : userStats;
  const isLoading = isAdmin ? globalStatsLoading : userStatsLoading;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Reading Statistics"
        subheader={isAdmin ? 'All users activity overview' : 'Your activity overview'}
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(6, minmax(0, 1fr))'
              }
            }}
          >
            <Box sx={{ textAlign: 'center', width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  {stats?.totalBorrowed || 0}
                </Typography>
                <Typography variant="caption">Borrowed</Typography>
              </Box>
            <Box sx={{ textAlign: 'center', width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  {stats?.totalReturned || 0}
                </Typography>
                <Typography variant="caption">Returned</Typography>
              </Box>
            <Box sx={{ textAlign: 'center', width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  {stats?.totalOverdue || 0}
                </Typography>
                <Typography variant="caption">Overdue</Typography>
              </Box>
            <Box sx={{ textAlign: 'center', width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                  {stats?.booksWishlisted || 0}
                </Typography>
                <Typography variant="caption">Wishlisted</Typography>
              </Box>
            <Box sx={{ textAlign: 'center', width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                  {stats?.booksReviewed || 0}
                </Typography>
                <Typography variant="caption">Reviewed</Typography>
              </Box>
            <Box sx={{ textAlign: 'center', width: '100%', py: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                  {(stats?.averageRating || 0).toFixed(1)}★
                </Typography>
                <Typography variant="caption">Avg Rating</Typography>
              </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const WishlistCard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const { data: stats, isLoading } = useReadingStatistics();
  const { data: globalWishlist, isLoading: globalWishlistLoading } = useGlobalWishlistCount();
  const wishlistCount = isAdmin ? (globalWishlist?.totalWishlisted || 0) : (stats?.booksWishlisted || 0);
  const loading = isAdmin ? globalWishlistLoading : isLoading;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Favorite sx={{ color: 'error.main' }} />}
        title="Wishlist"
        subheader={isAdmin ? 'All users wishlist entries' : 'Books you want to read'}
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
              {wishlistCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isAdmin ? 'Books wishlisted by all users' : 'Books in your wishlist'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentActivityCard = () => {
  const { data: activities = [], isLoading } = useRecentActivity();
  const displayActivities = Array.isArray(activities) ? activities : [];
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(displayActivities.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedActivities = displayActivities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<History sx={{ color: 'primary.main' }} />}
        title="Recent Activity"
        subheader="Your latest interactions"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : displayActivities.length > 0 ? (
          <Box>
            <TableContainer>
              <Table size="small" aria-label="recent activity table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56 }}>#</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell sx={{ width: 120 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedActivities.map((activity, idx) => (
                    <TableRow key={`${activity.type}-${activity.date}-${idx}`} hover>
                      <TableCell>{(currentPage - 1) * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{activity.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(activity.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  size="small"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_event, value) => setPage(value)}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recent activity
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
