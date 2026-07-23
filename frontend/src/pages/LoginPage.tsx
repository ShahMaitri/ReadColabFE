import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { useState } from 'react';
import { AnimatedBookLogo } from '../components/branding/AnimatedBookLogo';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    try {
      setError(null);
      const response = await authService.login(data.email, data.password);
      login(response);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        '@keyframes loginCardIn': {
          '0%': { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        '@keyframes loginBgDrift': {
          '0%': { backgroundPosition: '0% 0%, 100% 100%, 0 0' },
          '100%': { backgroundPosition: '8% 5%, 92% 95%, 0 0' }
        },
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(900px 420px at 15% 15%, rgba(118,210,207,0.16), transparent 50%), radial-gradient(800px 380px at 80% 80%, rgba(154,182,218,0.16), transparent 48%), #0f131a'
          : 'radial-gradient(900px 420px at 15% 15%, rgba(11,110,109,0.20), transparent 50%), radial-gradient(800px 380px at 80% 80%, rgba(59,83,112,0.14), transparent 48%), #f5f7fb',
        animation: 'loginBgDrift 6s ease-in-out infinite alternate'
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 5,
          animation: 'loginCardIn 420ms ease-out'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <AnimatedBookLogo badgeSize={68} bookWidth={52} bookHeight={40} durationSeconds={2.35} />
              <Typography variant='h5' gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center' }}>
                Sign in to continue to Smart Office Library
              </Typography>
            </Stack>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack component='form' spacing={2} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label='Email'
              type='email'
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
              fullWidth
            />
            <TextField
              label='Password'
              type={showPassword ? 'text' : 'password'}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        aria-label='Toggle password visibility'
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOffRoundedIcon fontSize='small' /> : <VisibilityRoundedIcon fontSize='small' />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button variant='contained' type='submit' disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            <Typography variant='body2' sx={{ textAlign: 'center' }}>
              Don't have an account?{' '}
              <MuiLink href='/register' sx={{ cursor: 'pointer', fontWeight: 600 }}>
                Register
              </MuiLink>
            </Typography>
          </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

