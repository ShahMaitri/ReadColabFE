import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';
import InsightsIcon from '@mui/icons-material/Insights';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { AnimatedBookLogo } from '../branding/AnimatedBookLogo';
import { BrandHighlightText } from '../branding/BrandHighlightText';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 260;

const navItemSx = {
  borderRadius: 2,
  mx: 1,
  mb: 0.5,
  '&.active': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '& .MuiListItemIcon-root': {
      color: 'primary.contrastText'
    }
  }
};

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100%' }} role='presentation'>
      <Box sx={{ px: 2.5, pt: 3.25, pb: 2.5 }}>
        <Stack sx={{ alignItems: 'center', textAlign: 'center' }}>
          <AnimatedBookLogo badgeSize={52} bookWidth={44} bookHeight={34} durationSeconds={2.35} />
          <Typography variant='h6' sx={{ lineHeight: 1.1, mt: 1.5 }}>
            <BrandHighlightText sx={{ fontSize: { xs: '1.3rem', md: '1.4rem' } }}>
              Read Colab
            </BrandHighlightText>
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.15 }}>
            Smart Office Library
          </Typography>
        </Stack>
      </Box>

      <List>
        {isAdmin ? (
          <>
            <ListItemButton component={NavLink} to='/admin' end sx={navItemSx}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary='Admin Dashboard' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/' sx={navItemSx}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary='Statistics' />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton component={NavLink} to='/' sx={navItemSx}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary='Dashboard' />
          </ListItemButton>
        )}
        <ListItemButton component={NavLink} to='/books' sx={navItemSx}>
          <ListItemIcon>
            <AutoStoriesIcon />
          </ListItemIcon>
          <ListItemText primary='Books' />
        </ListItemButton>
        {!isAdmin && (
          <ListItemButton component={NavLink} to='/my-books' sx={navItemSx}>
            <ListItemIcon>
              <LocalLibraryIcon />
            </ListItemIcon>
            <ListItemText primary='My Books' />
          </ListItemButton>
        )}
        {!isAdmin && (
          <ListItemButton component={NavLink} to='/wishlist' sx={navItemSx}>
            <ListItemIcon>
              <BookmarkIcon />
            </ListItemIcon>
            <ListItemText primary='Wishlist' />
          </ListItemButton>
        )}
        {!isAdmin && (
          <ListItemButton component={NavLink} to='/borrow-history' sx={navItemSx}>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary='Borrow History' />
          </ListItemButton>
        )}
        {!isAdmin && (
          <ListItemButton component={NavLink} to='/my-reviews' sx={navItemSx}>
            <ListItemIcon>
              <RateReviewIcon />
            </ListItemIcon>
            <ListItemText primary='My Reviews' />
          </ListItemButton>
        )}

        {/* Personal Library Section */}
        {!isAdmin && (
          <>
            <Box sx={{ px: 2, mt: 2, mb: 1 }}>
              <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                PERSONAL LIBRARY
              </Typography>
            </Box>
            <ListItemButton component={NavLink} to='/personal-library' end sx={navItemSx}>
              <ListItemIcon>
                <ShareIcon />
              </ListItemIcon>
              <ListItemText primary='Browse Books' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/personal-library/my-books' sx={navItemSx}>
              <ListItemIcon>
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText primary='My Shared Books' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/personal-library/borrowed' sx={navItemSx}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary='My Requests' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/personal-library/requests' sx={navItemSx}>
              <ListItemIcon>
                <AssignmentTurnedInIcon />
              </ListItemIcon>
              <ListItemText primary='Borrow Requests' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/personal-library/settings' sx={navItemSx}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary='Library Settings' />
            </ListItemButton>
          </>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/admin/users' sx={navItemSx}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary='Manage Users' />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/admin/borrows' sx={navItemSx}>
            <ListItemIcon>
              <AssignmentTurnedInIcon />
            </ListItemIcon>
            <ListItemText primary='Borrow Approvals' />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/admin/reservations' sx={navItemSx}>
            <ListItemIcon>
              <EventAvailableIcon />
            </ListItemIcon>
            <ListItemText primary='Reservations' />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/admin/reviews' sx={navItemSx}>
            <ListItemIcon>
              <RateReviewIcon />
            </ListItemIcon>
            <ListItemText primary='Reviews' />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/reports' sx={navItemSx}>
            <ListItemIcon>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary='Reports' />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        variant='temporary'
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth
          }
        }}
      >
        <Box onClick={onClose}>{drawerContent}</Box>
      </Drawer>

      <Drawer
        variant='permanent'
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
