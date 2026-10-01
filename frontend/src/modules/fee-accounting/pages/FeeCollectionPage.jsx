// src/modules/fee-accounting/pages/FeeCollectionPage.jsx
import React from 'react';
import { Box, Container } from '@mui/material';
import FeeCollection from '../components/FeeCollection';
import './FeeCollectionPage.css';

const FeeCollectionPage = () => {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <FeeCollection />
      </Box>
    </Container>
  );
};

export default FeeCollectionPage;