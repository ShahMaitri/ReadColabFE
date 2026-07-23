import { alpha, Container, Typography, Box, Stack, ButtonBase } from '@mui/material';
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
import { useAuth } from '../hooks/useAuth';

export const EmployeeDashboardPage = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const getRefreshAnimSx = (_delayMs: number) => ({
    animation: 'none'
  });

  const getSectionIconSpinSx = () => ({
    '& .MuiCardHeader-avatar .MuiSvgIcon-root': {
      animation: isRefreshing ? 'sectionIconSpin 2000ms linear 1' : 'none'
    }
  });

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

    const refreshQueriesPromise = Promise.all(
      dashboardQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );

    const minimumAnimationPromise = new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 2000);
    });

    await Promise.all([refreshQueriesPromise, minimumAnimationPromise]);
    setIsRefreshing(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 2.5 },
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, 0.24)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`
              : `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.24)} 0%, ${alpha('#ffffff', 0.97)} 100%)`
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
            gap: 2,
            alignItems: { xs: 'start', md: 'center' }
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              {isAdmin ? 'Statistics' : 'Dashboard'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Here's your reading activity overview.
            </Typography>
          </Box>
          <Stack
            direction='row'
            spacing={1.5}
            sx={{
              justifySelf: { xs: 'end', md: 'end' },
              justifyContent: 'flex-end',
              alignItems: 'center',
              alignSelf: { xs: 'flex-end', md: 'center' }
            }}
          >
            <ButtonBase
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label='Refresh dashboard'
              sx={{
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
                transition: 'transform 160ms ease, opacity 160ms ease',
                '&:active': {
                  transform: 'scale(0.92)'
                }
              }}
            >
              <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    animation: isRefreshing ? 'refreshSpin 850ms linear infinite' : 'none'
                  }}
                >
                  <RefreshIcon fontSize='small' />
                </Box>
                <Typography variant='caption' color='text.secondary'>
                  Refresh
                </Typography>
              </Stack>
            </ButtonBase>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          '@keyframes refreshSpin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' }
          },
          '@keyframes sectionIconSpin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' }
          },
          '@keyframes dashRefreshPulse': {
            '0%': {
              opacity: 0.95,
              filter: 'brightness(1) saturate(1)'
            },
            '45%': {
              opacity: 1,
              filter: 'brightness(1.06) saturate(1.05)'
            },
            '100%': {
              opacity: 1,
              filter: 'brightness(1) saturate(1)'
            }
          }
        }}
      />

      {/* Primary Stats Row */}
      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
        }}
      >
        <Box sx={{ ...getRefreshAnimSx(0), ...getSectionIconSpinSx(), position: 'relative' }}>
          <BooksAvailableCard />
        </Box>
        <Box sx={{ ...getRefreshAnimSx(70), ...getSectionIconSpinSx(), position: 'relative' }}>
          <BooksBorrowedCard />
        </Box>
        <Box sx={{ ...getRefreshAnimSx(140), ...getSectionIconSpinSx(), position: 'relative' }}>
          <OpenRequestsCard />
        </Box>
        <Box sx={{ ...getRefreshAnimSx(210), ...getSectionIconSpinSx(), position: 'relative' }}>
          <WishlistCard />
        </Box>
        <Box sx={{ ...getRefreshAnimSx(280), ...getSectionIconSpinSx(), position: 'relative' }}>
          <DueSoonCard />
        </Box>
      </Box>

      {/* Reading Statistics */}
      <Box sx={{ mb: 3, ...getRefreshAnimSx(350), ...getSectionIconSpinSx(), position: 'relative' }}>
        <ReadingStatisticsCard />
      </Box>

      {/* Recommendations and Recently Added Row */}
      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }
        }}
      >
        <Box sx={{ ...getRefreshAnimSx(420), ...getSectionIconSpinSx(), position: 'relative' }}>
          <RecommendedBooksCard />
        </Box>
        <Box sx={{ ...getRefreshAnimSx(490), ...getSectionIconSpinSx(), position: 'relative' }}>
          <RecentlyAddedCard />
        </Box>
      </Box>

      {/* Trending Books and Recent Activity Row */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }
        }}
      >
        <Box sx={{ ...getRefreshAnimSx(560), ...getSectionIconSpinSx(), position: 'relative' }}>
          <TrendingBooksCard />
        </Box>
        <Box sx={{ ...getRefreshAnimSx(630), ...getSectionIconSpinSx(), position: 'relative' }}>
          <RecentActivityCard />
        </Box>
      </Box>
    </Container>
  );
};
