import client from '@/lib/api';

/**
 * @file Token Utilities
 *
 * @description
 * This file contains utility functions for managing authentication tokens,
 * including token refresh logic using the OpenAPI client.
 */

/**
 * Refreshes the access token using the refresh token.
 *
 * @param refreshToken - The refresh token used to obtain a new access token.
 * @returns A new access token or null if the refresh fails.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const { data, error, response } = await client.POST(
      '/auth/token/refresh/',
      {
        body: {
          refresh: refreshToken,
          access: '',
        },
      }
    );

    if (error) {
      console.error('Failed to refresh access token:', response, error);
      return null;
    }

    console.log('Access token successfully refreshed.');
    return data.access || null;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}
