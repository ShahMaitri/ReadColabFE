import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper
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
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

  const { stats, mostBorrowed, leastBorrowed, lateReturns, recentActivity } = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Books" value={stats.totalBooks} icon={BookIcon} color="#3498db" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={stats.totalUsers} icon={PeopleIcon} color="#2ecc71" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            icon={AutorenewIcon}
            color="#f39c12"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reservations"
            value={stats.totalReservations}
            icon={EventIcon}
            color="#9b59b6"
          />
        </Grid>
      </Grid>

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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Borrow Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Borrow Trend (Last 30 Days)
            </Typography>
            {borrowTrend && borrowTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={borrowTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3498db" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Borrow Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Borrow Status
            </Typography>
            {borrowStatus && borrowStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={borrowStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {borrowStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Most Borrowed Books */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Most Borrowed Books
            </Typography>
            {mostBorrowed && mostBorrowed.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mostBorrowed}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="borrowCount" fill="#2ecc71" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Category Borrow Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Borrows by Category
            </Typography>
            {categoryStats && categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryStats.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={240} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="borrowCount" fill="#9b59b6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Users by Role */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Users by Role
            </Typography>
            {usersByRole && usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, count }) => `${role}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {usersByRole.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Least Borrowed Books */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Least Borrowed Books
            </Typography>
            {leastBorrowed && leastBorrowed.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leastBorrowed}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="borrowCount" fill="#e74c3c" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Late Returns Table */}
      {lateReturns && lateReturns.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Late Returns ({lateReturns.length})
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    User
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Book
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Due Date
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    Days Overdue
                  </th>
                </tr>
              </thead>
              <tbody>
                {lateReturns.map((item) => {
                  const daysOverdue = Math.floor(
                    (new Date().getTime() - new Date(item.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={item.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {item.user?.name}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {item.book?.title}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: '#e74c3c' }}>
                        {daysOverdue} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}
    </Container>
  );
};
