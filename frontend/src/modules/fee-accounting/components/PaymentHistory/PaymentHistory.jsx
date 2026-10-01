import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Search, FilterList, Receipt, Visibility } from '@mui/icons-material';
import { usePayment } from '../../hooks';
import { formatCurrency } from '../../utils';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../constants';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    status: '',
    search: '',
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { getPayments } = usePayment();

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    const data = await getPayments(filters);
    setPayments(data);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'partial': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box className="fee-accounting-paymenthistory-paymenthistory-payment-history-container">
      <Typography variant="h4" gutterBottom>
        Payment History
      </Typography>

      <Paper className="fee-accounting-paymenthistory-paymenthistory-filters-section" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            type="date"
            label="From"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Payment Method"
            value={filters.payment_method}
            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Methods</MenuItem>
            {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value.replace('_', ' ').toUpperCase()}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Status</MenuItem>
            {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            placeholder="Search by student or receipt"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" startIcon={<FilterList />} onClick={fetchPayments}>
            Apply Filters
          </Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Collected By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.receipt_number}</TableCell>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.student_name}</TableCell>
                  <TableCell>{payment.class}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.payment_method}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{payment.collected_by}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(payment)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" title="View Receipt">
                      <Receipt />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {payments.length === 0 && (
        <Box textAlign="center" my={4}>
          <Typography color="textSecondary">
            No payment records found for the selected criteria
          </Typography>
        </Box>
      )}

      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md">
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Receipt Number
                  </Typography>
                  <Typography>{selectedPayment.receipt_number}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography>
                    {new Date(selectedPayment.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Student
                  </Typography>
                  <Typography>{selectedPayment.student_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Class
                  </Typography>
                  <Typography>{selectedPayment.class}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedPayment.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography>{selectedPayment.payment_method}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Reference
                  </Typography>
                  <Typography>{selectedPayment.reference || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedPayment.status}
                    color={getStatusColor(selectedPayment.status)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography>{selectedPayment.notes || 'No notes'}</Typography>
                </Grid>
              </Grid>

              {selectedPayment.bills && selectedPayment.bills.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Applied Bills
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Bill Description</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Original Amount</TableCell>
                        <TableCell>Paid Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPayment.bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.description}</TableCell>
                          <TableCell>
                            {new Date(bill.due_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{formatCurrency(bill.original_amount)}</TableCell>
                          <TableCell>{formatCurrency(bill.paid_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.print()}>
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistory;