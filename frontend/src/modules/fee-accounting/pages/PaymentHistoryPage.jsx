import React from 'react';
import { Box, Container } from '@mui/material';
import PaymentHistory from '../components/PaymentHistory';
import './PaymentHistoryPage.css';

const PaymentHistoryPage = () => {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <PaymentHistory />
      </Box>
    </Container>
  );
};

export default PaymentHistoryPage;