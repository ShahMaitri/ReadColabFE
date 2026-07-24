import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
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
import { BrandHighlightText } from '../components/branding/BrandHighlightText';

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
    <div className='login-container'>
      <Card
        className='login-card'
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 5,
          '@keyframes loginCardIn': {
            from: {
              opacity: 0,
              transform: 'translateY(40px) scale(0.95)'
            },
            to: {
              opacity: 1,
              transform: 'translateY(0) scale(1)'
            }
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Stack spacing={1} sx={{ alignItems: 'center' }} className='login-logo'>
              <AnimatedBookLogo badgeSize={68} bookWidth={52} bookHeight={40} durationSeconds={2.35} />
              <Typography variant='h5' gutterBottom className='login-title' sx={{ animation: 'slideInDown 600ms ease 200ms both' }}>
                <BrandHighlightText>Read Colab</BrandHighlightText>
              </Typography>
              <Typography variant='body2' color='text.secondary' className='login-subtitle' sx={{ textAlign: 'center', animation: 'fadeIn 600ms ease 300ms both' }}>
                Sign in to continue to Smart Office Library
              </Typography>
            </Stack>

            {error && (
              <Alert severity='error' className='login-error' sx={{ mb: 2, animation: 'slideInDown 400ms ease both' }}>
                {error}
              </Alert>
            )}
            <Stack component='form' spacing={2} onSubmit={handleSubmit(onSubmit)} className='login-form'>
              <div className='login-field'>
                <TextField
                  label='Email'
                  type='email'
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email')}
                  fullWidth
                  className='login-input'
                  slotProps={{
                    input: {
                      sx: { animation: 'slideInUp 500ms ease 100ms both' }
                    }
                  }}
                />
              </div>
              <div className='login-field'>
                <TextField
                  label='Password'
                  type={showPassword ? 'text' : 'password'}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  {...register('password')}
                  fullWidth
                  className='login-input'
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
                      ),
                      sx: { animation: 'slideInUp 500ms ease 150ms both' }
                    }
                  }}
                />
              </div>
              <Button
                variant='contained'
                type='submit'
                disabled={isSubmitting}
                fullWidth
                className='login-button'
                sx={{
                  animation: 'fadeIn 600ms ease 400ms both',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-4px) scale(1.02)'
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(-2px) scale(0.98)'
                  }
                }}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
              <Typography variant='body2' className='login-link' sx={{ textAlign: 'center', animation: 'fadeIn 600ms ease 500ms both' }}>
                Don't have an account?{' '}
                <MuiLink href='/register' sx={{ cursor: 'pointer', fontWeight: 600, position: 'relative', '&::after': { content: "''", position: 'absolute', bottom: -2, left: 0, width: 0, height: 2, background: 'linear-gradient(90deg, #a100ff, #7f1dff)', transition: 'width 300ms ease' }, '&:hover::after': { width: '100%' } }}>
                  Register
                </MuiLink>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

