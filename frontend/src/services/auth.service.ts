import { apiClient } from '../api/axios';
import type { AuthResponse } from '../types/auth';

export const authService = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      { email, password, name }
    );
    return response.data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ success: boolean; data: { accessToken: string } }>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  }
};

