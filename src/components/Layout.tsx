/**
 * Layout component providing the application's common structure
 * This file demonstrates:
 * - Navigation bar implementation
 * - Styled components with MUI
 * - Responsive layout design
 * - Route linking with react-router-dom
 */

import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { toast } from 'sonner';
import axios from 'axios';

/**
 * Optional: Styled navigation link component
 * Demonstrates custom styling with MUI's styled API
 */
const StyledLink = styled(RouterLink)`
  color: white;
  text-decoration: none;
  margin: 0 16px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  position: relative;
  font-weight: 500;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    color: white;
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    color: white;
  }
`;

/**
 * Optional: Styled AppBar component
 * Demonstrates theme integration with styled components
 */
const StyledAppBar = styled(AppBar)`
  background-color: ${props => props.theme.palette.primary.main};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps all pages
 * Demonstrates:
 * - Responsive container usage
 * - Navigation implementation
 * - Database reset functionality
 * 
 * @param children - React components to be rendered within the layout
 */
const Layout = ({ children }: LayoutProps) => {
  /**
   * Optional: Handler for database reset
   * Demonstrates API integration and toast notifications
   */
  const handleResetDatabase = async () => {
    try {
      await axios.post('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/reset');
      toast.success('Database reset successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reset database');
      console.error('Error resetting database:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
    }}>
      <StyledAppBar position="static">
        <Toolbar sx={{ maxWidth: 1440, width: '100%', margin: '0 auto' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            Personal Trainer
          </Typography>
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            <StyledLink to="/customers">Customers</StyledLink>
            <StyledLink to="/trainings">Trainings</StyledLink>
            <StyledLink to="/calendar">Calendar</StyledLink>
            <StyledLink to="/statistics">Statistics</StyledLink>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleResetDatabase}
              sx={{
                ml: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Reset Database
            </Button>
          </nav>
        </Toolbar>
      </StyledAppBar>
      <Container 
        maxWidth={false}
        sx={{ 
          flex: 1,
          mt: 4,
          mb: 4,
          px: 3,
          maxWidth: '1440px !important',
          minWidth: '1440px !important',
          backgroundColor: 'background.default',
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 