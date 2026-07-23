import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';
import InsightsIcon from '@mui/icons-material/Insights';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 260;

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <Drawer open={open} onClose={onClose} variant='temporary'>
      <Box sx={{ width: drawerWidth }} role='presentation' onClick={onClose}>
        <List>
          <ListItemButton component={NavLink} to='/'>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary='Dashboard' />
          </ListItemButton>
          <ListItemButton component={NavLink} to='/books'>
            <ListItemIcon>
              <AutoStoriesIcon />
            </ListItemIcon>
            <ListItemText primary='Books' />
          </ListItemButton>
          <ListItemButton component={NavLink} to='/my-books'>
            <ListItemIcon>
              <LocalLibraryIcon />
            </ListItemIcon>
            <ListItemText primary='My Books' />
          </ListItemButton>
          <ListItemButton component={NavLink} to='/wishlist'>
            <ListItemIcon>
              <BookmarkIcon />
            </ListItemIcon>
            <ListItemText primary='Wishlist' />
          </ListItemButton>
          <ListItemButton component={NavLink} to='/borrow-history'>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary='Borrow History' />
          </ListItemButton>
          <ListItemButton component={NavLink} to='/my-reviews'>
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            <ListItemText primary='My Reviews' />
          </ListItemButton>
        </List>
        <Divider />
        {isAdmin && (
          <List>
            <ListItemText primary='Admin' sx={{ px: 2, pt: 1 }} />
            <ListItemButton component={NavLink} to='/admin'>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary='Admin Dashboard' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/admin/borrows'>
              <ListItemIcon>
                <LibraryBooksIcon />
              </ListItemIcon>
              <ListItemText primary='Borrow Approvals' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/admin/reservations'>
              <ListItemIcon>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText primary='Reservations' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/admin/reviews'>
              <ListItemIcon>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText primary='Review Management' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/admin/users'>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary='Manage Users' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/reports'>
              <ListItemIcon>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary='Reports' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/admin/books'>
              <ListItemIcon>
                <AutoStoriesIcon />
              </ListItemIcon>
              <ListItemText primary='Manage Books' />
            </ListItemButton>
            <ListItemButton component={NavLink} to='/books/create'>
              <ListItemIcon>
                <AutoStoriesIcon />
              </ListItemIcon>
              <ListItemText primary='Add Book' />
            </ListItemButton>
          </List>
        )}
      </Box>
    </Drawer>
  );
};
