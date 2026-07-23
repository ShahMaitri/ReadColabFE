import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert
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
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Copies available for borrowing
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const BooksBorrowedCard = () => {
  const { data: borrows = [], isLoading } = useUserBorrows();
  const borrowedCount = borrows.filter(b => b.status === 'BORROWED').length;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<LocalLibrary sx={{ color: 'warning.main' }} />}
        title="Books Borrowed"
        subheader="Your Current Borrows"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {borrowedCount}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Currently borrowed by you
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const OpenRequestsCard = () => {
  const { data: borrows = [], isLoading } = useUserBorrows();
  const openRequestsCount = borrows.filter((borrow) => borrow.status === 'PENDING').length;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Schedule sx={{ color: 'warning.main' }} />}
        title="Borrow Requests"
        subheader="Your pending borrow requests"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {openRequestsCount}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Awaiting admin approval
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const DueSoonCard = () => {
  const { data: dueSoon = [], isLoading } = useDueSoonBooks();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Schedule sx={{ color: 'error.main' }} />}
        title="Due Soon"
        subheader="Books due in 7 days"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : dueSoon.length > 0 ? (
          <Box>
            <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
              {dueSoon.length}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Books to return soon
            </Typography>
            <List sx={{ mt: 1 }}>
              {dueSoon.slice(0, 3).map((book, idx) => (
                <ListItem key={idx} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={<Typography variant="caption">{book.book?.title}</Typography>}
                    secondary={<Typography variant="caption2">Due: {new Date(book.dueDate).toLocaleDateString()}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No books due soon
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const RecommendedBooksCard = () => {
  const { data: recommended = [], isLoading } = useRecommendedBooks();
  const displayBooks = Array.isArray(recommended) ? recommended.slice(0, 5) : [];

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
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {displayBooks.map((book, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{book.title}</Typography>}
                  secondary={<Typography variant="caption">{book.author}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentlyAddedCard = () => {
  const { data: recentBooks = [], isLoading } = useRecentlyAddedBooks();

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
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {Array.isArray(recentBooks) && recentBooks.slice(0, 5).map((book, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{book.title}</Typography>}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption">{book.author}</Typography>
                      <Chip label={book.category} size="small" variant="outlined" />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export const TrendingBooksCard = () => {
  const { data: trending = [], isLoading } = useTrendingBooks();
  const displayBooks = Array.isArray(trending) ? trending.slice(0, 5) : [];

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
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {displayBooks.map((book, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ minWidth: 24 }}>{idx + 1}</Typography>
                  <ListItemText
                    sx={{ ml: 2 }}
                    primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{book.title}</Typography>}
                    secondary={<Typography variant="caption">{book.author}</Typography>}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export const ReadingStatisticsCard = () => {
  const { data: stats, isLoading } = useReadingStatistics();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Reading Statistics"
        subheader="Your activity overview"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  {stats?.totalBorrowed || 0}
                </Typography>
                <Typography variant="caption">Borrowed</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  {stats?.totalReturned || 0}
                </Typography>
                <Typography variant="caption">Returned</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  {stats?.totalOverdue || 0}
                </Typography>
                <Typography variant="caption">Overdue</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                  {stats?.booksWishlisted || 0}
                </Typography>
                <Typography variant="caption">Wishlisted</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                  {stats?.booksReviewed || 0}
                </Typography>
                <Typography variant="caption">Reviewed</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                  {(stats?.averageRating || 0).toFixed(1)}★
                </Typography>
                <Typography variant="caption">Avg Rating</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export const WishlistCard = () => {
  const { data: stats, isLoading } = useReadingStatistics();
  const wishlistCount = stats?.booksWishlisted || 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<Favorite sx={{ color: 'error.main' }} />}
        title="Wishlist"
        subheader="Books you want to read"
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
              {wishlistCount}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Books in your wishlist
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentActivityCard = () => {
  const { data: activities = [], isLoading } = useRecentActivity();
  const displayActivities = Array.isArray(activities) ? activities.slice(0, 6) : [];

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
          <List sx={{ maxHeight: 350, overflow: 'auto' }}>
            {displayActivities.map((activity, idx) => (
              <ListItem key={idx} sx={{ py: 0.75 }}>
                <ListItemText
                  primary={<Typography variant="body2">{activity.title}</Typography>}
                  secondary={
                    <Typography variant="caption">
                      {new Date(activity.date).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No recent activity
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
