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
  IconButton,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, FilterList, Send, Download } from '@mui/icons-material';
import { usePayment } from '../../hooks';
import { formatCurrency } from '../../utils';
import './OutstandingFees.css';

const OutstandingFees = () => {
  const [outstandingData, setOutstandingData] = useState([]);
  const [filters, setFilters] = useState({
    class: '',
    status: '',
    search: '',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

  const { getOutstandingReport } = usePayment();

  useEffect(() => {
    fetchOutstandingData();
  }, [filters]);

  const fetchOutstandingData = async () => {
    const data = await getOutstandingReport(filters);
    setOutstandingData(data);
  };

  const handleSendReminder = (student) => {
    setSelectedStudent(student);
    setReminderDialogOpen(true);
  };

  const handleReminderSend = async () => {
    // Implement reminder sending logic
    console.log('Sending reminder to:', selectedStudent);
    setReminderDialogOpen(false);
  };

  const handleExport = () => {
    // Implement export logic
    console.log('Exporting data');
  };

  const calculateTotalOutstanding = () => {
    return outstandingData.reduce((total, student) => total + student.total_outstanding, 0);
  };

  return (
    <Box className="fee-accounting-outstandingfees-outstandingfees-outstanding-fees-container">
      <Typography variant="h4" gutterBottom>
        Outstanding Fees
      </Typography>

      <Paper className="fee-accounting-outstandingfees-outstandingfees-summary-card" sx={{ mb: 3, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary">Total Outstanding</Typography>
            <Typography variant="h4" color="error.main">
              {formatCurrency(calculateTotalOutstanding())}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {outstandingData.length} students with outstanding fees
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Box>
      </Paper>

      <Paper className="fee-accounting-outstandingfees-outstandingfees-filters-section" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search by student name or ID"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            label="Class"
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Classes</MenuItem>
            <MenuItem value="10">Grade 10</MenuItem>
            <MenuItem value="9">Grade 9</MenuItem>
            <MenuItem value="11">Grade 11</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Total Due</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Outstanding</TableCell>
                <TableCell>Overdue Days</TableCell>
                <TableCell>Last Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outstandingData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{formatCurrency(student.total_due)}</TableCell>
                  <TableCell>{formatCurrency(student.paid_amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatCurrency(student.total_outstanding)}
                      color={student.overdue_days > 30 ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {student.overdue_days > 0 ? (
                      <Chip
                        label={`${student.overdue_days} days`}
                        color="error"
                        size="small"
                      />
                    ) : 'None'}
                  </TableCell>
                  <TableCell>
                    {student.last_payment_date
                      ? new Date(student.last_payment_date).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleSendReminder(student)}
                      title="Send Reminder"
                    >
                      <Send />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={reminderDialogOpen} onClose={() => setReminderDialogOpen(false)}>
        <DialogTitle>Send Payment Reminder</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Typography gutterBottom>
                Student: {selectedStudent.name}
              </Typography>
              <Typography gutterBottom color="textSecondary">
                Outstanding Amount: {formatCurrency(selectedStudent.total_outstanding)}
              </Typography>
              <Typography gutterBottom color="textSecondary">
                Overdue Days: {selectedStudent.overdue_days}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReminderSend} variant="contained" color="primary">
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OutstandingFees;