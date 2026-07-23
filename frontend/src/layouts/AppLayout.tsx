import { Box, Container } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FloatingChatbot } from '../components/ai/FloatingChatbot';
import { Navbar } from '../components/navigation/Navbar';
import { Sidebar } from '../components/navigation/Sidebar';

const DRAWER_WIDTH = 260;

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(1200px 520px at 100% -10%, rgba(192,104,255,0.12), transparent 40%), radial-gradient(900px 420px at 0% 100%, rgba(120,162,255,0.10), transparent 35%)'
          : 'radial-gradient(1200px 520px at 100% -10%, rgba(161,0,255,0.12), transparent 40%), radial-gradient(900px 420px at 0% 100%, rgba(63,103,234,0.10), transparent 35%)'
      }}
    >
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Container
        maxWidth='xl'
        sx={{
          py: 3,
          pl: { md: `calc(${DRAWER_WIDTH}px + 20px)` },
          pr: { xs: 2, md: 3 }
        }}
      >
        <Outlet />
      </Container>
      <FloatingChatbot />
    </Box>
  );
};
