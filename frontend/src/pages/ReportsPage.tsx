import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useMemo, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { downloadReport, useReportingDashboard } from '../hooks/useReports';

const REPORT_TYPES = [
  { label: 'Monthly Reports', value: 'monthly' },
  { label: 'Department Reports', value: 'department' },
  { label: 'Borrow Reports', value: 'borrow' },
  { label: 'Most Popular Books', value: 'popular-books' },
  { label: 'Reading Trends', value: 'reading-trends' }
] as const;

type ReportType = (typeof REPORT_TYPES)[number]['value'];

export const ReportsPage = () => {
  const { showNotification } = useNotification();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [reportType, setReportType] = useState<ReportType>('monthly');

  const filters = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      department: department || undefined
    }),
    [startDate, endDate, department]
  );

  const { data, isLoading, error } = useReportingDashboard(filters);

  const departments = useMemo(
    () => (data?.departments || []).map((item) => item.department),
    [data?.departments]
  );

  const handleDownload = async (format: 'csv' | 'excel') => {
    try {
      await downloadReport(reportType, format, filters);
      showNotification(`Downloaded ${reportType} report (${format.toUpperCase()})`, 'success');
    } catch (_error) {
      showNotification('Failed to download report', 'error');
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setDepartment('');
  };

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
        <InsightsIcon color='primary' />
        <Typography variant='h4' sx={{ fontWeight: 700 }}>
          Analytics Dashboard
        </Typography>
      </Stack>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <FilterAltIcon color='action' />
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
          </Stack>

          <TextField
            label='Start Date'
            type='date'
            size='small'
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 170 }}
          />

          <TextField
            label='End Date'
            type='date'
            size='small'
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 170 }}
          />

          <FormControl size='small' sx={{ minWidth: 170 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              label='Department'
              onChange={(event) => setDepartment(event.target.value)}
            >
              <MenuItem value=''>All Departments</MenuItem>
              {departments.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant='outlined' onClick={handleResetFilters}>
            Reset
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <FormControl size='small' sx={{ minWidth: 190 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label='Report Type'
              onChange={(event) => setReportType(event.target.value as ReportType)}
            >
              {REPORT_TYPES.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant='contained' startIcon={<DownloadIcon />} onClick={() => void handleDownload('csv')}>
            Export CSV
          </Button>

          <Button variant='contained' color='secondary' startIcon={<DownloadIcon />} onClick={() => void handleDownload('excel')}>
            Export Excel
          </Button>
        </Stack>
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Failed to load reports
        </Alert>
      )}

      {data && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' }
            }}
          >
            <Paper sx={{ p: 2.5 }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
                Monthly Reports
              </Typography>
              <ResponsiveContainer width='100%' height={320}>
                <LineChart data={data.monthly}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='totalBorrows' stroke='#1565c0' strokeWidth={2} />
                  <Line type='monotone' dataKey='returned' stroke='#2e7d32' strokeWidth={2} />
                  <Line type='monotone' dataKey='overdue' stroke='#c62828' strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
                Department Reports
              </Typography>
              <ResponsiveContainer width='100%' height={320}>
                <BarChart data={data.departments}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='department' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='totalBorrows' fill='#6a1b9a' />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }
            }}
          >
            <Paper sx={{ p: 2.5 }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
                Most Popular Books
              </Typography>
              <ResponsiveContainer width='100%' height={320}>
                <BarChart data={data.popularBooks.slice(0, 8)}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='title' tick={{ fontSize: 11 }} angle={-20} textAnchor='end' height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='borrowCount' fill='#ef6c00' />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
                Reading Trends
              </Typography>
              <ResponsiveContainer width='100%' height={320}>
                <LineChart data={data.readingTrends}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 11 }} angle={-25} textAnchor='end' height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='requested' stroke='#00838f' strokeWidth={2} />
                  <Line type='monotone' dataKey='returned' stroke='#43a047' strokeWidth={2} />
                  <Line type='monotone' dataKey='overdue' stroke='#d81b60' strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
              Borrow Reports
            </Typography>

            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Borrowed At</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.borrows.slice(0, 20).map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{new Date(row.borrowedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{row.userName || row.userEmail || '-'}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.bookTitle || '-'}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {data.borrows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        No borrow report rows found for selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Stack>
      )}
    </Box>
  );
};
