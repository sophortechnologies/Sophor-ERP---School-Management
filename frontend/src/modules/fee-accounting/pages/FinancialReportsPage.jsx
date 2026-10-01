import React from 'react';
import { Box, Container } from '@mui/material';
import FinancialReports from '../components/FinancialReports';
import './FinancialReportsPage.css';

const FinancialReportsPage = () => {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <FinancialReports />
      </Box>
    </Container>
  );
};

export default FinancialReportsPage;