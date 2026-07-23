import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { notificationService } from '../services/notification.service';
import { AuthContext } from './AuthContext';

interface NotificationContextType {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const showNotification = (msg: string, sev: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!userId) {
      seenNotificationIds.current.clear();
      initialized.current = false;
      return;
    }

    let isMounted = true;

    const checkForNewNotifications = async () => {
      try {
        const response = await notificationService.list({
          unreadOnly: true,
          limit: 10,
          page: 1
        });

        if (!isMounted) {
          return;
        }

        const latest = response.data;

        if (!initialized.current) {
          latest.forEach((item) => seenNotificationIds.current.add(item.id));
          initialized.current = true;
          return;
        }

        const newItems = latest.filter((item) => !seenNotificationIds.current.has(item.id));
        newItems.forEach((item) => seenNotificationIds.current.add(item.id));

        if (newItems.length > 0) {
          showNotification(newItems[0].title, 'info');
        }
      } catch (_error) {
        // Best-effort polling; ignore transient API errors.
      }
    };

    void checkForNewNotifications();
    const intervalId = window.setInterval(() => {
      void checkForNewNotifications();
    }, 30_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
