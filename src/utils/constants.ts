export const DJANGO_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authRoutes = ['api/auth/'];
export const unprotectedRoutes = ['/test'];
