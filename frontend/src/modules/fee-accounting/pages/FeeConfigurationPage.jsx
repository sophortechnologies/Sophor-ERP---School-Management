import React from 'react';
import { Box, Container } from '@mui/material';
import FeeStructure from '../components/FeeStructure';
import './FeeConfigurationPage.css';

const FeeConfigurationPage = () => {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <FeeStructure />
      </Box>
    </Container>
  );
};

export default FeeConfigurationPage;