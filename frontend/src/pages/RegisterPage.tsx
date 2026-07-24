import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, Stack, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { useState } from 'react';
import { AnimatedBookLogo } from '../components/branding/AnimatedBookLogo';
import { BrandHighlightText } from '../components/branding/BrandHighlightText';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    try {
      setError(null);
      const response = await authService.register(data.email, data.password, data.name);
      login(response);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              <AnimatedBookLogo badgeSize={52} bookWidth={44} bookHeight={34} durationSeconds={2.35} />
              <Typography variant='h5' gutterBottom className='login-title' sx={{ animation: 'slideInDown 600ms ease 200ms both' }}>
                Create Account
              </Typography>
              <Typography variant='body2' color='text.secondary' className='login-subtitle' sx={{ textAlign: 'center', animation: 'fadeIn 600ms ease 300ms both' }}>
                Join{' '}
                <BrandHighlightText>
                  Read Colab
                </BrandHighlightText>{' '}
                - Smart Office Library
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
                  label='Full Name'
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  {...register('name')}
                  fullWidth
                  slotProps={{
                    input: {
                      sx: { animation: 'slideInUp 500ms ease 100ms both' }
                    }
                  }}
                />
              </div>
              <div className='login-field'>
                <TextField
                  label='Email'
                  type='email'
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email')}
                  fullWidth
                  slotProps={{
                    input: {
                      sx: { animation: 'slideInUp 500ms ease 150ms both' }
                    }
                  }}
                />
              </div>
              <div className='login-field'>
                <TextField
                  label='Password'
                  type='password'
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  {...register('password')}
                  fullWidth
                  slotProps={{
                    input: {
                      sx: { animation: 'slideInUp 500ms ease 200ms both' }
                    }
                  }}
                />
              </div>
              <div className='login-field'>
                <TextField
                  label='Confirm Password'
                  type='password'
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                  fullWidth
                  slotProps={{
                    input: {
                      sx: { animation: 'slideInUp 500ms ease 250ms both' }
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
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
              <Typography variant='body2' className='login-link' textAlign='center' sx={{ animation: 'fadeIn 600ms ease 500ms both' }}>
                Already have an account?{' '}
                <MuiLink href='/login' sx={{ cursor: 'pointer', fontWeight: 600, position: 'relative', '&::after': { content: "''", position: 'absolute', bottom: -2, left: 0, width: 0, height: 2, background: 'linear-gradient(90deg, #a100ff, #7f1dff)', transition: 'width 300ms ease' }, '&:hover::after': { width: '100%' } }}>
                  Sign In
                </MuiLink>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};
