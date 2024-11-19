/**
 * @file API Client Configuration with Authentication Middleware
 *
 * @description
 * This module defines an OpenAPI client configured for a Django/DRF backend.
 *
 * It includes:
 * - A custom fetch override to handle Content-Length headers (avoiding chunked encoding issues).
 * - Middleware to automatically inject a Bearer token into requests for authenticated APIs.
 */
import { auth } from '@/auth';
import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@/app/types/openapi';

/**
 * Custom Fetch Implementation
 *
 * @remarks
 * Overrides the default `fetch` behavior to resolve issues with Django/DRF's
 * handling of `Transfer-Encoding: chunked` requests. This implementation ensures
 * that the `Content-Length` header is correctly set, making the requests compatible
 * with the backend.
 *
 * @param input - The original `Request` object to be processed.
 * @returns A `Response` object after sending the reconstructed request.
 */
const customFetch: typeof fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  if (typeof input === 'string' || input instanceof URL) {
    // For string or URL inputs, use the provided `init` without changes
    return fetch(input, init);
  }

  if (input instanceof Request) {
    // Clone the request to safely read its body
    const clonedRequest = input.clone();
    const url = clonedRequest.url;
    const body = clonedRequest.body ? await clonedRequest.text() : undefined;

    // Reconstruct the request init object
    const reconstructedInit: RequestInit = {
      method: clonedRequest.method,
      headers: { ...Object.fromEntries(clonedRequest.headers.entries()) }, // Clone headers
      body, // Explicitly set the body as a string (or undefined)
    };

    return fetch(url, reconstructedInit);
  }

  throw new TypeError(
    'Invalid input type for customFetch. Expected string, URL, or Request.'
  );
};

/**
 * API Client
 *
 * @remarks
 * Creates a strongly typed OpenAPI client targeting the Django backend.
 * The client includes a base URL, default headers, and a custom fetch implementation
 * for compatibility with Django/DRF.
 */
const client = createClient<paths>({
  baseUrl: 'http://localhost:8000',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  Request: undefined, // Override the default Request constructor usage
  fetch: customFetch, // Use the custom fetch implementation
});

/**
 * Cached Access Token
 *
 * @remarks
 * Stores the access token retrieved via the `auth` module. The token is cached
 * in memory for subsequent requests. Ensure proper token invalidation and refresh
 * logic in production environments.
 */
let accessToken: string | undefined = undefined;

/**
 * Authentication Middleware
 *
 * @remarks
 * This middleware intercepts API requests to add a Bearer token for authentication.
 * It fetches and caches the token using the `auth` module. If the token is unavailable,
 * it attempts to fetch it from the user's session.
 *
 * @example
 * ```typescript
 * client.use(authMiddleware);
 * ```
 */
const authMiddleware: Middleware = {
  /**
   * Handles the `onRequest` lifecycle hook to inject the Authorization header.
   *
   * @param request - The intercepted API request.
   * @returns The modified request with the Authorization header added.
   * @throws Will throw an error if the token cannot be retrieved.
   */
  async onRequest({ request }) {
    if (request.url.includes('/auth/login')) {
      console.log('Skipping authMiddleware for login request.');
      return request;
    }

    // fetch token, if it doesn’t exist
    if (!accessToken) {
      const session = await auth();
      if (session && session.accessToken) {
        accessToken = session.accessToken;
      } else {
        // Handle authentication errors (e.g., redirect to login)
        console.error('Failed to retrieve access token.');
        throw new Error('Authentication error');
      }
    }

    // (optional) add logic here to refresh token when it expires

    // add Authorization header to every request
    console.log('Adding Authorization header:', `Bearer ${accessToken}`);
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
};

/**
 * Attach the authentication middleware to the API client.
 */
client.use(authMiddleware);

/**
 * Exported API Client
 *
 * @remarks
 * Provides a configured API client for use throughout the application. This client
 * includes authentication middleware and custom request handling logic.
 *
 * @example
 * ```typescript
 * import apiClient from '@/apiClient';
 *
 * const response = await apiClient.GET('/example-endpoint');
 * ```
 */
export default client;
