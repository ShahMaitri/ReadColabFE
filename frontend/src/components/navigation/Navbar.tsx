import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Badge, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service';
import { NotificationDrawer, notificationKeys } from '../notifications/NotificationDrawer';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: Boolean(user),
    refetchInterval: 30_000
  });

  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <AppBar
      position='sticky'
      color='inherit'
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar>
        <IconButton edge='start' onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant='h6'>Smart Office Library</Typography>
          <Typography variant='caption' color='text.secondary'>
            Enterprise Workspace
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title='Notifications'>
            <IconButton onClick={() => setDrawerOpen(true)} size='small'>
              <Badge badgeContent={unreadCount} color='error'>
                <NotificationsIcon fontSize='small' />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {user?.name ?? 'Guest'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {user?.role ?? 'Unknown'}
            </Typography>
          </Box>
          <Tooltip title='Sign out'>
            <IconButton onClick={handleLogout} size='small'>
              <LogoutIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </AppBar>
  );
};
