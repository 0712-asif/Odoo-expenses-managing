import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ '& p': { mb: 2 }, '& h6': { mt: 3, mb: 2, fontWeight: 600 } }}>
          <Typography variant="h6">Information We Collect</Typography>
          <Typography variant="body1">
            We collect information you provide directly to us, such as when you create an account, submit expense reports, or contact us for support.
          </Typography>

          <Typography variant="h6">How We Use Your Information</Typography>
          <Typography variant="body1">
            We use the information we collect to:
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2 }}>
            â€¢ Provide and maintain our expense management services<br/>
            â€¢ Process your expense submissions and approvals<br/>
            â€¢ Send you administrative information and updates<br/>
            â€¢ Respond to your inquiries and provide customer support<br/>
            â€¢ Generate reports and analytics for your organization
          </Typography>

          <Typography variant="h6">Information Sharing</Typography>
          <Typography variant="body1">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
          </Typography>

          <Typography variant="h6">Data Security</Typography>
          <Typography variant="body1">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Typography>

          <Typography variant="h6">Data Retention</Typography>
          <Typography variant="body1">
            We retain your information for as long as necessary to provide our services and comply with legal obligations.
          </Typography>

          <Typography variant="h6">Your Rights</Typography>
          <Typography variant="body1">
            You have the right to:
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2 }}>
            â€¢ Access your personal information<br/>
            â€¢ Correct inaccurate information<br/>
            â€¢ Request deletion of your information<br/>
            â€¢ Object to processing of your information
          </Typography>

          <Typography variant="h6">Contact Us</Typography>
          <Typography variant="body1">
            If you have any questions about this Privacy Policy, please contact us at privacy@expensemanagement.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Privacy;