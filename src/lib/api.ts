import axios from 'axios';
import { auth } from '@/auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

// Request interceptor to add auth header
apiClient.interceptors.request.use(async (config) => {
  const session = await auth();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Response interceptor to handle 401s and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await auth();
        if (session?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
