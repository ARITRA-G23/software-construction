import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {  // <-- add children from props
  const { logout } = useAuth();

  const drawer = (
    <Box
      sx={{ width: drawerWidth, bgcolor: '#1e1e1e', height: '100vh', color: 'white', position: 'fixed' }}
      role="presentation"
    >
      <Typography variant="h6" sx={{ my: 2, textAlign: 'center', fontWeight: 'bold', color: '#90caf9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif', sans-serif", fontSize: '1rem' }}>
        E-commerce Product Manager
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/dashboard">
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/products">
            <ListItemText primary="Products" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/bulk-upload">
            <ListItemText primary="Bulk Upload" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', color: 'black' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1e1e1e', position: 'fixed', height: '100vh' },
        }}
        open
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px`, bgcolor: '#f5f5f5', minHeight: '100vh' }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;