import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  alpha,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DRAWER_WIDTH = 240;
const HEADER_HEIGHT = 72;

const navItemSx = {
  borderRadius: 2,
  mx: 1,
  mb: 0.5,
  '&.Mui-selected': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '& .MuiListItemIcon-root': {
      color: 'primary.contrastText'
    },
    '&:hover': {
      bgcolor: 'primary.main'
    }
  }
};

export const AdminLayout = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { label: 'Manage Users', path: '/admin/users', icon: <PeopleIcon /> },
    { label: 'Borrow Requests', path: '/admin/borrows', icon: <AssignmentTurnedInIcon /> },
    { label: 'Reservations', path: '/admin/reservations', icon: <EventAvailableIcon /> },
    { label: 'Reviews', path: '/admin/reviews', icon: <RateReviewIcon /> }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ height: '100%' }}>
      <Box
        sx={{
          p: 2.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.34)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.26)} 0%, ${alpha('#ffffff', 0.96)} 100%)`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Admin Panel
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Manage operations and workflows
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              sx={navItemSx}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/"
            sx={{ borderRadius: 2 }}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="Back to App" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage:
          theme.palette.mode === 'dark'
            ? 'radial-gradient(1200px 520px at 100% -10%, rgba(118,210,207,0.10), transparent 40%), radial-gradient(900px 420px at 0% 100%, rgba(154,182,218,0.08), transparent 35%)'
            : 'radial-gradient(1200px 520px at 100% -10%, rgba(11,110,109,0.10), transparent 40%), radial-gradient(900px 420px at 0% 100%, rgba(59,83,112,0.08), transparent 35%)'
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        color='transparent'
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.78)
        }}
      >
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important` }}>
          {isMobile && (
            <MenuIcon
              sx={{ mr: 2, cursor: 'pointer' }}
              onClick={() => setMobileOpen(true)}
            />
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              mt: `${HEADER_HEIGHT}px`,
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.96)
            }
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <CloseIcon
              sx={{ cursor: 'pointer' }}
              onClick={() => setMobileOpen(false)}
            />
          </Box>
          {drawer}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 3 },
          py: 3,
          mt: `${HEADER_HEIGHT}px`,
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
