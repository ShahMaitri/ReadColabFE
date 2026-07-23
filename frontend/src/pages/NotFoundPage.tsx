import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <SearchOffIcon color='action' sx={{ fontSize: 56 }} />
        <Typography variant='h5'>404 - Page Not Found</Typography>
        <Typography color='text.secondary'>
          The page you are trying to access does not exist.
        </Typography>
        <Button variant='contained' onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Box>
  );
};
