import axios, { AxiosError } from 'axios';
import { authStorage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: AxiosError | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();

  // Let the browser set multipart boundaries for FormData uploads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof (config.headers as any).delete === 'function') {
      (config.headers as any).delete('Content-Type');
    } else if (config.headers) {
      delete (config.headers as any)['Content-Type'];
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          authStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const newAccessToken = response.data.data.accessToken;
        authStorage.setAccessToken(newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null);

        return apiClient(originalRequest);
      } catch (err) {
        processQueue(error);
        authStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      authStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

