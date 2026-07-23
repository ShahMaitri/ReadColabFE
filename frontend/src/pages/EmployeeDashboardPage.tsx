import { Container, Grid, Typography, Box, Button, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  BooksAvailableCard,
  BooksBorrowedCard,
  OpenRequestsCard,
  DueSoonCard,
  RecommendedBooksCard,
  RecentlyAddedCard,
  TrendingBooksCard,
  ReadingStatisticsCard,
  WishlistCard,
  RecentActivityCard
} from '../components/dashboard/DashboardCards';

export const EmployeeDashboardPage = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const dashboardQueryKeys = [
      'availableBooks',
      'userBorrows',
      'userWishlist',
      'dueSoon',
      'readingStats',
      'recentActivity',
      'recentlyAdded',
      'trendingBooks',
      'recommendedBooks'
    ];

    await Promise.all(
      dashboardQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );
    setIsRefreshing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome back! Here's your reading activity overview.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* Primary Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <BooksAvailableCard />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BooksBorrowedCard />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OpenRequestsCard />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DueSoonCard />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <WishlistCard />
        </Grid>
      </Grid>

      {/* Reading Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <ReadingStatisticsCard />
        </Grid>
      </Grid>

      {/* Recommendations and Recently Added Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <RecommendedBooksCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecentlyAddedCard />
        </Grid>
      </Grid>

      {/* Trending Books and Recent Activity Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TrendingBooksCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecentActivityCard />
        </Grid>
      </Grid>
    </Container>
  );
};
