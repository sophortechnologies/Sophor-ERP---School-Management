import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import { formatCurrency } from '../../utils';
import './Receipt.css';

const Receipt = ({ payment }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download logic
    console.log('Download receipt as PDF');
  };

  return (
    <Box className="fee-accounting-receipt-receipt-receipt-container">
      <Paper className="receipt-paper" elevation={3}>
        <Box className="fee-accounting-receipt-receipt-receipt-header" textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            SCHOOL MANAGEMENT SYSTEM
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Official Fee Receipt
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Receipt No: {payment.receipt_number}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Date
            </Typography>
            <Typography>
              {new Date(payment.created_at).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2" color="textSecondary">
              Time
            </Typography>
            <Typography>
              {new Date(payment.created_at).toLocaleTimeString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box className="student-details" mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Student Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Student Name
              </Typography>
              <Typography>{payment.student_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Student ID
              </Typography>
              <Typography>{payment.student_id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Class
              </Typography>
              <Typography>{payment.class}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Section
              </Typography>
              <Typography>{payment.section || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box className="payment-details" mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Payment Details
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell align="right">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="right">
                    {payment.payment_method.toUpperCase()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Reference Number</TableCell>
                  <TableCell align="right">
                    {payment.reference || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Collected By</TableCell>
                  <TableCell align="right">
                    {payment.collected_by}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {payment.bills && payment.bills.length > 0 && (
          <Box className="bill-breakdown" mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Bill Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {payment.bills.map((bill, index) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        {bill.description}
                        <Typography variant="caption" display="block" color="textSecondary">
                          Due: {new Date(bill.due_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(bill.paid_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box className="receipt-total" textAlign="right">
          <Typography variant="h6">
            Total Amount: {formatCurrency(payment.amount)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Paid in full
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box className="fee-accounting-receipt-receipt-receipt-footer" textAlign="center">
          <Typography variant="body2" color="textSecondary">
            Thank you for your payment!
          </Typography>
          <Typography variant="caption" color="textSecondary">
            This is a computer-generated receipt. No signature required.
          </Typography>
        </Box>
      </Paper>

      <Box className="action-buttons" mt={3} display="flex" gap={2} justifyContent="center">
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
        >
          Download PDF
        </Button>
      </Box>
    </Box>
  );
};

export default Receipt;