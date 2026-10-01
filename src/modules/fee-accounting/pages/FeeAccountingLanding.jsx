import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Button, 
  Card, 
  CardContent
} from '@mui/material';
import { 
  DollarSign, 
  Settings, 
  FileText, 
  History, 
  TrendingUp, 
  Users,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';
import './FeeAccountingLanding.css';

const FeeAccountingLanding = () => {
  const navigate = useNavigate();
  
  const [summary] = React.useState({
    todayCollection: 0,
    monthlyCollection: 0,
    outstanding: 0,
    totalStudents: 0
  });
  
  const modules = [
    {
      id: 'collection',
      title: 'Fee Collection',
      description: 'Collect fees, process payments, issue receipts',
      icon: <DollarSign size={32} />,
      path: '/admin/fee-accounting/collection',
      color: '#1b633b',
      available: true
    },
    {
      id: 'configuration',
      title: 'Fee Configuration',
      description: 'Configure fee structures and payment terms',
      icon: <Settings size={32} />,
      path: '/admin/fee-accounting/configuration',
      color: '#172b4c',
      available: true
    },
    {
      id: 'history',
      title: 'Payment History',
      description: 'View payment records and receipts',
      icon: <History size={32} />,
      path: '/admin/fee-accounting/history',
      color: '#1b633b',
      available: true
    },
    {
      id: 'reports',
      title: 'Financial Reports',
      description: 'Generate statements and analytics',
      icon: <FileText size={32} />,
      path: '/admin/fee-accounting/reports',
      color: '#172b4c',
      available: true
    },
  ];

  const statsCards = [
    {
      title: "Today's Collection",
      value: summary.todayCollection,
      icon: <CreditCard size={20} />,
      color: '#1b633b',
      description: 'Fees collected today'
    },
    {
      title: "Monthly Collection",
      value: summary.monthlyCollection,
      icon: <DollarSign size={20} />,
      color: '#172b4c',
      description: 'Fees this month'
    },
    {
      title: "Outstanding",
      value: summary.outstanding,
      icon: <TrendingUp size={20} />,
      color: '#1b633b',
      description: 'Pending fees'
    },
    {
      title: "Total Students",
      value: summary.totalStudents,
      icon: <Users size={20} />,
      color: '#172b4c',
      description: 'Enrolled students'
    },
  ];

  const handleModuleClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="xl" className="fee-accounting-feeaccountinglanding-fee-accounting-container">
      <Box py={2}>
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h5" gutterBottom sx={{ color: '#1b633b', fontWeight: 600 }}>
            Fee Accounting
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage financial transactions and fee collection
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper sx={{ p: 2, borderLeft: `3px solid ${card.color}` }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h6" sx={{ color: card.color, fontWeight: 600, my: 0.5 }}>
                      {card.title.includes('Collection') || card.title.includes('Outstanding') 
                        ? formatCurrency(card.value)
                        : card.value}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: `${card.color}15`, p: 1, borderRadius: 1 }}>
                    <Box sx={{ color: card.color }}>
                      {card.icon}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#172b4c', fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button 
              variant="contained" 
              size="small"
              startIcon={<DollarSign size={16} />}
              onClick={() => navigate('/admin/fee-accounting/collection')}
              sx={{ 
                backgroundColor: '#1b633b',
                '&:hover': { backgroundColor: '#14502f' }
              }}
            >
              Collect
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Settings size={16} />}
              onClick={() => navigate('/admin/fee-accounting/configuration')}
              sx={{ 
                borderColor: '#172b4c', 
                color: '#172b4c',
                '&:hover': {
                  borderColor: '#172b4c',
                  backgroundColor: 'rgba(23, 43, 76, 0.04)'
                }
              }}
            >
              Configure
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<History size={16} />}
              onClick={() => navigate('/admin/fee-accounting/history')}
              sx={{ 
                borderColor: '#1b633b', 
                color: '#1b633b',
                '&:hover': {
                  borderColor: '#1b633b',
                  backgroundColor: 'rgba(27, 99, 59, 0.04)'
                }
              }}
            >
              History
            </Button>
          </Box>
        </Paper>

        {/* Modules Grid */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#172b4c', fontWeight: 600, mb: 2 }}>
            Modules
          </Typography>
          <Grid container spacing={2}>
            {modules.map((module) => (
              <Grid item xs={12} sm={6} md={3} key={module.id}>
                <Card 
                  onClick={() => handleModuleClick(module.path)}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: module.available ? 1 : 0.6,
                    '&:hover': module.available ? {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 4px 12px ${module.color}30`,
                      borderColor: module.color
                    } : {},
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box sx={{ backgroundColor: `${module.color}15`, p: 1.5, borderRadius: 1, mr: 1.5 }}>
                        <Box sx={{ color: module.color }}>
                          {module.icon}
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" sx={{ color: module.color, fontWeight: 600 }}>
                        {module.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1.5 }}>
                      {module.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button 
                        variant="text" 
                        size="small"
                        sx={{ 
                          color: module.color,
                          fontSize: '0.75rem',
                          p: 0,
                          minWidth: 'auto'
                        }}
                      >
                        OPEN →
                      </Button>
                      {!module.available && (
                        <Typography variant="caption" color="textSecondary">
                          Soon
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default FeeAccountingLanding;