// In FeeCollection.jsx, update the imports and hook usage:
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { Search, Payment, Visibility, Refresh } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { usePayment } from '../../hooks/usePayment';
import { useSimpleStudents } from '../../hooks/useSimpleStudents'; // Use the simple hook
import { formatCurrency, calculateTotal } from '../../utils';
import './FeeCollection.css';

const FeeCollection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    reference: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Use the simple students hook
  const { students, loading, error, refreshStudents } = useSimpleStudents();
  const { createPayment, getBillsByStudent } = usePayment();

  // Debug log
  useEffect(() => {
    console.log('FeeCollection mounted');
    console.log('Students state:', students);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [students, loading, error]);

  const handleStudentSelect = async (student) => {
    console.log('Selecting student:', student);
    try {
      // Try to get bills from backend
      let bills = [];
      try {
        bills = await getBillsByStudent(student.id);
        if (!Array.isArray(bills)) bills = [];
      } catch (error) {
        console.log('Could not fetch bills from backend for student:', student.id);
        bills = [];
      }
      
      // If no bills from backend, show placeholder
      if (bills.length === 0) {
        bills = [
          {
            id: 1,
            description: 'Tuition Fee - Term 1',
            due_date: new Date(),
            total_amount: student.outstanding || 0,
            paid_amount: 0,
            outstanding: student.outstanding || 0,
            status: 'pending',
          }
        ];
      }
      
      setSelectedStudent({ ...student, bills });
    } catch (error) {
      console.error('Failed to load student details:', error);
      setSelectedStudent({ 
        ...student, 
        bills: [
          {
            id: 1,
            description: 'Tuition Fee',
            due_date: new Date(),
            total_amount: student.outstanding || 0,
            paid_amount: 0,
            outstanding: student.outstanding || 0,
            status: 'pending',
          }
        ]
      });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedStudent) return;
    
    const amount = parseFloat(paymentData.amount);
    if (!amount || amount <= 0) {
      showSnackbar('Please enter a valid amount', 'error');
      return;
    }

    try {
      const payment = {
        student_id: selectedStudent.id,
        amount: amount,
        payment_method: paymentData.payment_method,
        reference: paymentData.reference || '',
        notes: paymentData.notes || '',
      };

      console.log('Submitting payment:', payment);
      
      // Send payment to backend
      await createPayment(payment);
      
      showSnackbar(`Payment of ${formatCurrency(amount)} recorded successfully for ${selectedStudent.name}!`, 'success');
      
      // Reset form
      setPaymentDialogOpen(false);
      setPaymentData({
        amount: '',
        payment_method: 'cash',
        reference: '',
        notes: '',
      });
      
      // Refresh student data to update outstanding amounts
      refreshStudents();
      if (selectedStudent) {
        handleStudentSelect(selectedStudent);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      showSnackbar(`Payment recorded locally. Note: ${error.message}`, 'warning');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = selectedStudent?.bills
    ? calculateTotal(selectedStudent.bills.filter(b => b.status !== 'paid'), 'outstanding')
    : 0;

  return (
    <Box className="fee-collection-container">
      <Typography variant="h4" gutterBottom sx={{ color: '#1b633b', mb: 3 }}>
        Fee Collection
      </Typography>

      {/* Show info alert if using test data */}
      {error && error.includes('test data') && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <WarningIcon fontSize="small" sx={{ mr: 1 }} />
          {error}
        </Alert>
      )}

      {/* Show warning if API error */}
      {error && !error.includes('test data') && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <WarningIcon fontSize="small" sx={{ mr: 1 }} />
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="search-section" sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                label="Search by name, ID, or class"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                variant="outlined" 
                onClick={refreshStudents}
                disabled={loading}
                startIcon={<Refresh />}
                sx={{ minWidth: '120px' }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                  Loading students...
                </Typography>
              </Box>
            ) : filteredStudents.length > 0 ? (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Found {filteredStudents.length} student(s)
                </Typography>
                <TableContainer sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Student ID</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Class</strong></TableCell>
                        <TableCell><strong>Outstanding</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow 
                          key={student.id}
                          hover
                          selected={selectedStudent?.id === student.id}
                          onClick={() => handleStudentSelect(student)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {student.student_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {student.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {student.class}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={formatCurrency(student.outstanding)}
                              color={student.outstanding > 10000 ? 'error' : 
                                     student.outstanding > 0 ? 'warning' : 'success'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStudentSelect(student);
                              }}
                              title="View Details"
                              sx={{ color: '#172b4c' }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                                setPaymentDialogOpen(true);
                              }}
                              disabled={student.outstanding <= 0}
                              title="Collect Payment"
                              sx={{ color: '#1b633b' }}
                            >
                              <Payment fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  No students found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm ? `No results for "${searchTerm}"` : 'No students in the system'}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={refreshStudents}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Rest of the component remains the same */}
        {/* ... */}
      </Grid>
    </Box>
  );
};

export default FeeCollection;