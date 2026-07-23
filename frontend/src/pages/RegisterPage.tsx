import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { useState } from 'react';

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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Create Account
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Join Smart Office Library
          </Typography>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack component='form' spacing={2} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label='Full Name'
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
              fullWidth
            />
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
            <TextField
              label='Confirm Password'
              type='password'
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              fullWidth
            />
            <Button variant='contained' type='submit' disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            <Typography variant='body2' textAlign='center'>
              Already have an account?{' '}
              <MuiLink href='/login' sx={{ cursor: 'pointer', fontWeight: 500 }}>
                Sign In
              </MuiLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
