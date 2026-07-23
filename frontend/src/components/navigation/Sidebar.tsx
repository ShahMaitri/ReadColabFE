import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';
import InsightsIcon from '@mui/icons-material/Insights';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import BookmarkIconOutlined from '@mui/icons-material/BookmarkBorder';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
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
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.75 }}>
        <Stack spacing={0.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: (theme) => `0 10px 22px ${theme.palette.primary.main}55`
            }}
          >
            <AutoStoriesRoundedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            Read Colab
          </Typography>
          <Typography variant='caption' color='text.secondary'>
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
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary='Statistics' />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton component={NavLink} to='/' sx={navItemSx}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary='Statistics' />
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
              <EventNoteIcon />
            </ListItemIcon>
            <ListItemText primary='My Reviews' />
          </ListItemButton>
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
              <LibraryBooksIcon />
            </ListItemIcon>
            <ListItemText primary='Borrow Approvals' />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/admin/reservations' sx={navItemSx}>
            <ListItemIcon>
              <BookmarkIconOutlined />
            </ListItemIcon>
            <ListItemText primary='Reservations' />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton component={NavLink} to='/admin/reviews' sx={navItemSx}>
            <ListItemIcon>
              <EventNoteIcon />
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
