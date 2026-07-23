import {
  alpha,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  useAnalyticsDashboard,
  useOverdueStats,
  useBorrowTrendLastDays,
  useBorrowStatusDistribution,
  useUsersByRole,
  useCategoryBorrowStats
} from '../../hooks/useAnalytics';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

const StatCard = ({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        py: 2,
        '&:last-child': {
          pb: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: color,
            borderRadius: 2,
            display: 'flex'
          }}
        >
          <Icon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography color="textSecondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const AdminDashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumDown = useMediaQuery(theme.breakpoints.down('md'));
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useAnalyticsDashboard();
  const { data: overdueStats } = useOverdueStats();
  const { data: borrowTrend } = useBorrowTrendLastDays(30);
  const { data: borrowStatus } = useBorrowStatusDistribution();
  const { data: usersByRole } = useUsersByRole();
  const { data: categoryStats } = useCategoryBorrowStats();

  if (dashboardLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (dashboardError) {
    return (
      <Container>
        <Alert severity="error">Failed to load dashboard data</Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, mostBorrowed, leastBorrowed, lateReturns } = dashboardData;
  const baseChartHeight = isSmallScreen ? 260 : 320;
  const compactTickFontSize = isSmallScreen ? 10 : 12;
  const normalizedCategoryStats = (categoryStats ?? []).map((item) => ({
    ...item,
    borrowCount: Number(item.borrowCount) || 0
  }));
  const topCategoryStats = normalizedCategoryStats.slice(0, 8);
  const hasCategoryBorrowData = topCategoryStats.some((item) => item.borrowCount > 0);
  const normalizedLeastBorrowed = (leastBorrowed ?? []).map((item) => ({
    ...item,
    borrowCount: Number(item.borrowCount) || 0
  }));
  const leastBorrowedChartData = normalizedLeastBorrowed.map((item) => ({
    ...item,
    // Ensure zero-count books remain visible in chart while preserving actual value in tooltip.
    borrowCountChart: item.borrowCount === 0 ? 0.15 : item.borrowCount
  }));
  const shortenLabel = (value: string, max = 16) => {
    if (value.length <= max) {
      return value;
    }
    return `${value.slice(0, max)}...`;
  };
  const chartCardSx = {
    p: { xs: 2, md: 3 },
    borderRadius: '12px',
    border: '1px solid',
    borderColor: 'divider',
    height: '100%'
  };
  const chartContentSx = {
    height: baseChartHeight,
    width: '100%'
  };
  const chartTooltipStyle = {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.95) : alpha('#ffffff', 0.97),
    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
    borderRadius: 8,
    color: theme.palette.text.primary
  };
  const chartTooltipLabelStyle = {
    color: theme.palette.text.primary,
    fontWeight: 600
  };
  const chartTooltipItemStyle = {
    color: theme.palette.text.primary
  };
  const renderPieSliceLabel = (labelKey: 'status' | 'role') => (props: any) => {
    const { x, y, payload } = props;

    if (typeof x !== 'number' || typeof y !== 'number') {
      return null;
    }

    return (
      <text x={x} y={y} textAnchor='middle' fill={theme.palette.text.primary} fontSize={10}>
        <tspan x={x} dy='-0.2em'>
          {payload?.[labelKey] ?? ''}
        </tspan>
        <tspan x={x} dy='1.1em'>
          {payload?.count ?? 0}
        </tspan>
      </text>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, 0.26)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`
              : `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.24)} 0%, ${alpha('#ffffff', 0.96)} 100%)`
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Admin Dashboard
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
              Operations health, borrowing trends, and user behavior in one view.
            </Typography>
          </Box>
          <Stack
            direction='row'
            spacing={1}
            flexWrap='wrap'
            useFlexGap
            sx={{
              ml: 'auto',
              width: 'fit-content',
              justifyContent: 'flex-end',
              alignSelf: 'center'
            }}
          >
            <Chip
              size='small'
              variant='outlined'
              label={
                <Stack spacing={0.45} sx={{ alignItems: 'center', py: 0.35 }}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 700, lineHeight: 1.05 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant='caption' sx={{ lineHeight: 1.05 }}>
                    Users
                  </Typography>
                </Stack>
              }
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                height: 'auto',
                '& .MuiChip-label': {
                  px: 1.25,
                  pt: 1.2,
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            />
            <Chip
              size='small'
              variant='outlined'
              label={
                <Stack spacing={0.45} sx={{ alignItems: 'center', py: 0.35 }}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 700, lineHeight: 1.05 }}>
                    {stats.activeLoans}
                  </Typography>
                  <Typography variant='caption' sx={{ lineHeight: 1.05 }}>
                    Active Loans
                  </Typography>
                </Stack>
              }
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                height: 'auto',
                '& .MuiChip-label': {
                  px: 1.25,
                  pt: 1.2,
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Statistics Cards */}
      <Box
        sx={{
          mb: 4,
          width: '100%',
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))'
          }
        }}
      >
        <StatCard title="Total Books" value={stats.totalBooks} icon={BookIcon} color="#3498db" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={PeopleIcon} color="#2ecc71" />
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={AutorenewIcon}
          color="#f39c12"
        />
        <StatCard
          title="Total Reservations"
          value={stats.totalReservations}
          icon={EventIcon}
          color="#9b59b6"
        />
      </Box>

      {/* Overdue Warning */}
      {overdueStats && overdueStats.overdueCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {overdueStats.overdueCount} Overdue Books
            </Typography>
            <Typography variant="body2">
              {overdueStats.overduePercentage}% of active loans are overdue
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Charts Grid */}
      <Box
        sx={{
          mb: 4,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))'
          }
        }}
      >
        {/* Borrow Trend Chart */}
        <Box>
          <Paper elevation={0} sx={chartCardSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Borrow Trend (Last 30 Days)
            </Typography>
            <Box sx={chartContentSx}>
              {borrowTrend && borrowTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={borrowTrend} margin={{ top: 12, right: 16, left: 4, bottom: isSmallScreen ? 16 : 52 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: compactTickFontSize }}
                      angle={isSmallScreen ? 0 : -35}
                      textAnchor={isSmallScreen ? 'middle' : 'end'}
                      height={isSmallScreen ? 30 : 58}
                      interval={isSmallScreen ? 'preserveStartEnd' : 0}
                      minTickGap={isSmallScreen ? 22 : 10}
                    />
                    <YAxis width={isSmallScreen ? 30 : 42} tick={{ fontSize: compactTickFontSize }} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={chartTooltipLabelStyle}
                      itemStyle={chartTooltipItemStyle}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3498db" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Borrow Status Distribution */}
        <Box>
          <Paper elevation={0} sx={chartCardSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Borrow Status
            </Typography>
            <Box sx={chartContentSx}>
              {borrowStatus && borrowStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <Pie
                      data={borrowStatus}
                      cx="50%"
                      cy="46%"
                      nameKey="status"
                      labelLine={false}
                      label={isSmallScreen ? false : renderPieSliceLabel('status')}
                      outerRadius={isSmallScreen ? '62%' : '72%'}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {borrowStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign='bottom' height={36} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Most Borrowed Books */}
        <Box>
          <Paper elevation={0} sx={chartCardSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Most Borrowed Books
            </Typography>
            <Box sx={chartContentSx}>
            {mostBorrowed && mostBorrowed.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostBorrowed} margin={{ top: 8, right: 12, left: 2, bottom: isSmallScreen ? 18 : 68 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: compactTickFontSize }}
                    tickFormatter={(value: string) => shortenLabel(value, isSmallScreen ? 10 : 16)}
                    angle={isSmallScreen ? 0 : -35}
                    textAnchor={isSmallScreen ? 'middle' : 'end'}
                    interval={isSmallScreen ? 'preserveStartEnd' : 0}
                    minTickGap={isSmallScreen ? 22 : 10}
                    height={isSmallScreen ? 34 : 74}
                  />
                  <YAxis width={isSmallScreen ? 30 : 42} tick={{ fontSize: compactTickFontSize }} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                  <Legend />
                  <Bar dataKey="borrowCount" fill="#2ecc71" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                <Typography color="textSecondary">No data available</Typography>
              </Box>
            )}
            </Box>
          </Paper>
        </Box>

        {/* Category Borrow Stats */}
        <Box>
          <Paper elevation={0} sx={chartCardSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Borrows by Category
            </Typography>
            <Box sx={chartContentSx}>
              {topCategoryStats.length > 0 && hasCategoryBorrowData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategoryStats}
                    layout="vertical"
                    margin={{
                      top: 8,
                      right: isSmallScreen ? 8 : 12,
                      left: isSmallScreen ? 6 : 8,
                      bottom: 8
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      domain={[0, 'dataMax + 1']}
                      tick={{ fontSize: compactTickFontSize }}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={isSmallScreen ? 64 : 88}
                      tick={{ fontSize: compactTickFontSize }}
                      tickFormatter={(value: string) => shortenLabel(value, isSmallScreen ? 9 : 13)}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={chartTooltipLabelStyle}
                      itemStyle={chartTooltipItemStyle}
                    />
                    <Bar dataKey="borrowCount" fill="#9b59b6" minPointSize={4} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
              <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                <Typography color="textSecondary">No borrow activity by category yet</Typography>
              </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Users by Role */}
        <Box>
          <Paper elevation={0} sx={chartCardSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Users by Role
            </Typography>
            <Box sx={chartContentSx}>
            {usersByRole && usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="46%"
                    nameKey="role"
                    labelLine={false}
                    label={isSmallScreen ? false : renderPieSliceLabel('role')}
                    outerRadius={isSmallScreen ? '62%' : '72%'}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {usersByRole.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign='bottom' height={36} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                <Typography color="textSecondary">No data available</Typography>
              </Box>
            )}
            </Box>
          </Paper>
        </Box>

        {/* Least Borrowed Books */}
        <Box>
          <Paper elevation={0} sx={chartCardSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Least Borrowed Books
            </Typography>
            <Box sx={chartContentSx}>
            {leastBorrowedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leastBorrowedChartData} margin={{ top: 8, right: 12, left: 2, bottom: isSmallScreen ? 18 : 68 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: compactTickFontSize }}
                    tickFormatter={(value: string) => shortenLabel(value, isSmallScreen ? 10 : 16)}
                    angle={isSmallScreen ? 0 : -35}
                    textAnchor={isSmallScreen ? 'middle' : 'end'}
                    interval={isSmallScreen ? 'preserveStartEnd' : 0}
                    minTickGap={isSmallScreen ? 22 : 10}
                    height={isSmallScreen ? 34 : 74}
                  />
                  <YAxis
                    width={isSmallScreen ? 30 : 42}
                    tick={{ fontSize: compactTickFontSize }}
                    allowDecimals={false}
                    domain={[0, 'dataMax + 1']}
                  />
                  <Tooltip
                    formatter={(_value: any, _name: any, item: any) => [item?.payload?.borrowCount ?? 0, 'borrowCount']}
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />
                  <Legend />
                  <Bar dataKey="borrowCountChart" name="borrowCount" fill="#e74c3c" minPointSize={4} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                <Typography color="textSecondary">No data available</Typography>
              </Box>
            )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Late Returns Table */}
      {lateReturns && lateReturns.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Late Returns ({lateReturns.length})
          </Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.error.main, 0.08) }}>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Book</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Days Overdue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lateReturns.map((item) => {
                  const daysOverdue = Math.floor(
                    (new Date().getTime() - new Date(item.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.user?.name || '-'}</TableCell>
                      <TableCell>{item.book?.title || '-'}</TableCell>
                      <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          color='error'
                          variant='outlined'
                          label={`${daysOverdue} days`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};
