import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Terms of Service
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ '& p': { mb: 2 }, '& h6': { mt: 3, mb: 2, fontWeight: 600 } }}>
          <Typography variant="h6">1. Acceptance of Terms</Typography>
          <Typography variant="body1">
            By accessing and using the Expense Management System, you accept and agree to be bound by the terms and provision of this agreement.
          </Typography>

          <Typography variant="h6">2. Use License</Typography>
          <Typography variant="body1">
            Permission is granted to use the Expense Management System for business expense tracking and management purposes. This license is subject to the following restrictions:
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2 }}>
            â€¢ You may not use the system for any unlawful purpose<br/>
            â€¢ You may not modify, copy, or distribute the system<br/>
            â€¢ You may not attempt to reverse engineer the system
          </Typography>

          <Typography variant="h6">3. User Accounts</Typography>
          <Typography variant="body1">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Typography>

          <Typography variant="h6">4. Data Privacy</Typography>
          <Typography variant="body1">
            We are committed to protecting your privacy. All personal and business data is stored securely and will not be shared with third parties without your consent.
          </Typography>

          <Typography variant="h6">5. Service Availability</Typography>
          <Typography variant="body1">
            We strive to maintain high availability of our service, but cannot guarantee uninterrupted access. Maintenance windows will be communicated in advance when possible.
          </Typography>

          <Typography variant="h6">6. Limitation of Liability</Typography>
          <Typography variant="body1">
            In no event shall the Expense Management System or its suppliers be liable for any damages arising out of the use or inability to use the system.
          </Typography>

          <Typography variant="h6">7. Contact Information</Typography>
          <Typography variant="body1">
            If you have any questions about these Terms of Service, please contact us at support@expensemanagement.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms;