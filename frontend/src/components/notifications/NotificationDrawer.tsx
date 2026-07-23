import DoneAllIcon from '@mui/icons-material/DoneAll';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import {
  alpha,
  Chip,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { notificationService } from '../../services/notification.service';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const notificationKeys = {
  all: ['notifications'],
  list: () => [...notificationKeys.all, 'list'],
  unreadCount: () => [...notificationKeys.all, 'unread-count']
};

export const NotificationDrawer = ({ open, onClose }: NotificationDrawerProps) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationService.list({ page: 1, limit: 25 }),
    enabled: open
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }
  });

  const notifications = useMemo(() => {
    const rows = data?.data || [];
    return showUnreadOnly ? rows.filter((item) => !item.isRead) : rows;
  }, [data?.data, showUnreadOnly]);

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 320, sm: 400 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant='h6'>Notifications</Typography>
          <Button
            size='small'
            startIcon={<DoneAllIcon />}
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            Mark all read
          </Button>
        </Box>

        <Divider />

        <Stack direction='row' spacing={1} sx={{ px: 2, py: 1.25 }}>
          <Chip
            size='small'
            clickable
            color={!showUnreadOnly ? 'primary' : 'default'}
            variant={!showUnreadOnly ? 'filled' : 'outlined'}
            label='All'
            onClick={() => setShowUnreadOnly(false)}
          />
          <Chip
            size='small'
            clickable
            color={showUnreadOnly ? 'primary' : 'default'}
            variant={showUnreadOnly ? 'filled' : 'outlined'}
            label='Unread'
            onClick={() => setShowUnreadOnly(true)}
          />
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Typography variant='body2' color='text.secondary' sx={{ p: 2 }}>
              Loading notifications...
            </Typography>
          ) : notifications.length ? (
            <List disablePadding>
              {notifications.map((notification) => (
                <Box key={notification.id}>
                  <ListItem
                    secondaryAction={
                      !notification.isRead ? (
                        <IconButton
                          edge='end'
                          aria-label='mark as read'
                          onClick={() => markReadMutation.mutate(notification.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <MarkEmailReadIcon fontSize='small' />
                        </IconButton>
                      ) : undefined
                    }
                    sx={{
                      alignItems: 'flex-start',
                      bgcolor: notification.isRead
                        ? 'transparent'
                        : (theme) => alpha(theme.palette.primary.main, 0.08)
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant='subtitle2' sx={{ fontWeight: notification.isRead ? 500 : 700 }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component='span' variant='body2' color='text.primary'>
                            {notification.message}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component='li' />
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                You are all caught up
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                New updates will appear here automatically.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export { notificationKeys };
