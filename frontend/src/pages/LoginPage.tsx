import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Sign in to Smart Office Library
          </Typography>
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
              type='password'
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
              fullWidth
            />
            <Button variant='contained' type='submit' disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            <Typography variant='body2' textAlign='center'>
              Don't have an account?{' '}
              <MuiLink href='/register' sx={{ cursor: 'pointer', fontWeight: 500 }}>
                Register
              </MuiLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

