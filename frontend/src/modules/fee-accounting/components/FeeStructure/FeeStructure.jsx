import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { formatCurrency } from '../../utils';
import { FEE_TYPES, FREQUENCY } from '../../constants';
import './FeeStructure.css';

const FeeStructure = () => {
  const [feeConfigs, setFeeConfigs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    fee_type: 'tuition',
    class_id: '',
    amount: '0', // Initialize as string to prevent NaN
    frequency: 'monthly',
    due_day: '1', // Initialize as string to prevent NaN
    late_fee_rate: '0', // Initialize as string to prevent NaN
    status: 'active',
  });

  useEffect(() => {
    // Load from localStorage
    const savedConfigs = JSON.parse(localStorage.getItem('fee_configs') || '[]');
    setFeeConfigs(savedConfigs);
  }, []);

  const saveToLocalStorage = (configs) => {
    localStorage.setItem('fee_configs', JSON.stringify(configs));
  };

  const handleSubmit = () => {
    // Convert string values to numbers
    const newConfig = {
      id: editingConfig ? editingConfig.id : Date.now(),
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      due_day: parseInt(formData.due_day) || 1,
      late_fee_rate: parseFloat(formData.late_fee_rate) || 0,
      class_name: formData.class_id ? `Grade ${formData.class_id}` : 'All Classes',
      created_at: new Date().toISOString()
    };

    let updatedConfigs;
    if (editingConfig) {
      updatedConfigs = feeConfigs.map(config => 
        config.id === editingConfig.id ? newConfig : config
      );
    } else {
      updatedConfigs = [...feeConfigs, newConfig];
    }

    setFeeConfigs(updatedConfigs);
    saveToLocalStorage(updatedConfigs);
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      fee_type: config.fee_type,
      class_id: config.class_id,
      amount: config.amount.toString(), // Convert to string
      frequency: config.frequency,
      due_day: config.due_day.toString(), // Convert to string
      late_fee_rate: config.late_fee_rate.toString(), // Convert to string
      status: config.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this fee configuration?')) {
      const updatedConfigs = feeConfigs.filter(config => config.id !== id);
      setFeeConfigs(updatedConfigs);
      saveToLocalStorage(updatedConfigs);
    }
  };

  const resetForm = () => {
    setEditingConfig(null);
    setFormData({
      name: '',
      fee_type: 'tuition',
      class_id: '',
      amount: '0', // Reset to string
      frequency: 'monthly',
      due_day: '1', // Reset to string
      late_fee_rate: '0', // Reset to string
      status: 'active',
    });
  };

  return (
    <Box className="fee-accounting-feestructure-feestructure-fee-structure-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1b633b' }}>
          Fee Structure Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ backgroundColor: '#1b633b' }}
        >
          Add Fee Structure
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Fee Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Frequency</strong></TableCell>
                <TableCell><strong>Due Day</strong></TableCell>
                <TableCell><strong>Late Fee %</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeConfigs.length > 0 ? (
                feeConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={config.fee_type} 
                        size="small" 
                        sx={{ backgroundColor: '#e8f5e9', color: '#1b633b' }}
                      />
                    </TableCell>
                    <TableCell>{config.class_name}</TableCell>
                    <TableCell>{formatCurrency(config.amount)}</TableCell>
                    <TableCell>{config.frequency}</TableCell>
                    <TableCell>{config.due_day}</TableCell>
                    <TableCell>{config.late_fee_rate}%</TableCell>
                    <TableCell>
                      <Chip
                        label={config.status}
                        color={config.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(config)}
                        sx={{ color: '#172b4c' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(config.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No fee configurations found. Click "Add Fee Structure" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#1b633b' }}>
          {editingConfig ? 'Edit Fee Structure' : 'Create Fee Structure'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fee Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Fee Type"
                value={formData.fee_type}
                onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                required
              >
                {Object.values(FEE_TYPES).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Class (Optional)"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                placeholder="e.g., 10 for Grade 10"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value || '0' })}
                required
                InputProps={{
                  startAdornment: 'ETB ',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
              >
                {Object.values(FREQUENCY).map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {freq.replace('_', ' ').charAt(0).toUpperCase() + freq.replace('_', ' ').slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Day of Month"
                type="number"
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value || '1' })}
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Late Fee Rate (%)"
                type="number"
                value={formData.late_fee_rate}
                onChange={(e) => setFormData({ ...formData, late_fee_rate: e.target.value || '0' })}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ backgroundColor: '#1b633b' }}
            disabled={!formData.name || !formData.amount}
          >
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeStructure;