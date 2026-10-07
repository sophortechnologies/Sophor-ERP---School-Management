import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
} from '@mui/icons-material';
import { usePayment } from '../../hooks';
import { formatCurrency } from '../../utils';
import { REPORT_TYPES } from '../../constants';
import './FinancialReports.css';

const FinancialReports = () => {
  const [reportType, setReportType] = useState('daily_collection');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [summary, setSummary] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getFinancialSummary, getCollectionReport } = usePayment();

  useEffect(() => {
    fetchSummary();
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchSummary = async () => {
    const data = await getFinancialSummary();
    setSummary(data);
  };

 // In FinancialReports.jsx, update the fetchReportData function:
const fetchReportData = async () => {
  setLoading(true);
  try {
    const params = {
      report_type: reportType,
      ...dateRange,
    };
    const data = await getCollectionReport(params); // This should now work
    setCollectionData(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to fetch report data:', error);
    setCollectionData([]); // Set empty array on error
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: summary?.total_revenue || 0,
      icon: <AttachMoney />,
      color: '#4caf50',
      trend: summary?.revenue_growth || 0,
    },
    {
      title: 'Outstanding',
      value: summary?.total_outstanding || 0,
      icon: <TrendingDown />,
      color: '#f44336',
    },
    {
      title: 'Today\'s Collection',
      value: summary?.todays_collection || 0,
      icon: <AccountBalance />,
      color: '#2196f3',
    },
    {
      title: 'Monthly Average',
      value: summary?.monthly_average || 0,
      icon: <TrendingUp />,
      color: '#ff9800',
    },
  ];

  return (
    <Box className="fee-accounting-financialreports-financialreports-financial-reports-container">
      <Typography variant="h4" gutterBottom>
        Financial Reports & Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="fee-accounting-financialreports-financialreports-summary-card" sx={{ borderLeft: `4px solid ${card.color}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(card.value)}
                    </Typography>
                    {card.trend !== undefined && (
                      <Typography
                        variant="body2"
                        color={card.trend >= 0 ? 'success.main' : 'error.main'}
                      >
                        {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
                      </Typography>
                    )}
                  </Box>
                  <Box className="card-icon" sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper className="report-controls" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {Object.entries(REPORT_TYPES).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value.replace('_', ' ').toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchReportData}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Collected By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectionData.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.receipt_number}</TableCell>
                    <TableCell>{transaction.student_name}</TableCell>
                    <TableCell>
                      <Chip label={transaction.fee_type} size="small" />
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.payment_method}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.collected_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {!loading && collectionData.length === 0 && (
        <Box textAlign="center" my={4}>
          <Typography color="textSecondary">
            No data available for the selected criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FinancialReports;