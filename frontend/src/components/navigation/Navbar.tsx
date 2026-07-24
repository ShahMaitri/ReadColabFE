import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import MonitorRoundedIcon from '@mui/icons-material/MonitorRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  AppBar,
  Badge,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service';
import { NotificationDrawer, notificationKeys } from '../notifications/NotificationDrawer';
import { useThemePreference } from '../../context/ThemeContext';
import { BrandHighlightText } from '../branding/BrandHighlightText';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { preference, setPreference, resolvedMode } = useThemePreference();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [headerSearch, setHeaderSearch] = useState('');

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

  const handleHeaderSearch = () => {
    const value = headerSearch.trim();
    navigate(value ? `/books?search=${encodeURIComponent(value)}` : '/books');
  };

  return (
    <AppBar
      position='sticky'
      color='inherit'
      elevation={0}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => `${theme.palette.background.paper}CC`
      }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton edge='start' onClick={onMenuClick} sx={{ mr: 0.5, display: { xs: 'inline-flex', md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 180 }}>
          <Typography variant='h6' sx={{ lineHeight: 1.1 }}>
            <BrandHighlightText>Read Colab</BrandHighlightText>
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.1 }}>
            Smart Office Library
          </Typography>
        </Box>

        <TextField
          placeholder='Search books, authors, ISBN...'
          size='small'
          value={headerSearch}
          onChange={(event) => setHeaderSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleHeaderSearch();
            }
          }}
          sx={{ display: { xs: 'none', sm: 'inline-flex' }, width: { sm: 260, md: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start' sx={{ cursor: 'pointer' }} onClick={handleHeaderSearch}>
                <SearchRoundedIcon fontSize='small' />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Tooltip title='Theme Settings'>
            <IconButton size='small' onClick={(event) => setThemeAnchor(event.currentTarget)}>
              <LightModeRoundedIcon fontSize='small' />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={themeAnchor}
            open={Boolean(themeAnchor)}
            onClose={() => setThemeAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem selected={preference === 'light'} onClick={() => { setPreference('light'); setThemeAnchor(null); }}>
              <LightModeRoundedIcon fontSize='small' sx={{ mr: 1 }} /> Light
            </MenuItem>
            <MenuItem selected={preference === 'system'} onClick={() => { setPreference('system'); setThemeAnchor(null); }}>
              <MonitorRoundedIcon fontSize='small' sx={{ mr: 1 }} /> System
            </MenuItem>
          </Menu>

          <Tooltip title='Notifications'>
            <IconButton onClick={() => setDrawerOpen(true)} size='small'>
              <Badge badgeContent={unreadCount} color='error'>
                <NotificationsIcon fontSize='small' />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {user?.name ?? 'Guest'}
            </Typography>
            <Chip size='small' variant='outlined' label={user?.role ?? 'Unknown'} sx={{ height: 20, mt: 0.25 }} />
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
