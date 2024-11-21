import { auth } from '@/auth';
import type { Middleware } from 'openapi-fetch';
import { refreshAccessToken } from '@/lib/tokenUtils';

/**
 * @file Authentication Middleware
 *
 * @description
 * Middleware to automatically inject a Bearer token into requests for
 * authenticated APIs. Handles token refresh when the access token is expired.
 */

let accessToken: string | undefined;
let refreshToken: string | undefined;

/**
 * Authentication Middleware
 *
 * @remarks
 * Intercepts API requests to add a Bearer token for authentication. Refreshes
 * the token if it has expired, and retrieves tokens from the session if needed.
 */
export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (request.url.includes('/api/auth/signin')) {
      return request;
    }

    // Attempt to refresh the token if accessToken is missing
    if (!accessToken && refreshToken) {
      console.log('Access token missing. Attempting to refresh.');
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        accessToken = newAccessToken;
      } else {
        console.error('Failed to refresh access token.');
        throw new Error('Authentication error');
      }
    }

    // Attempt to fetch token if not already available
    if (!accessToken) {
      const session = await auth();
      if (session?.accessToken && session?.refreshToken) {
        accessToken = session.accessToken;
        refreshToken = session.refreshToken;
      } else {
        console.log('Session: ', session);
        console.error('Failed to retrieve session tokens.');
        throw new Error('Authentication error');
      }
    }

    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
};
