import createClient from 'openapi-fetch';
import { DJANGO_API_BASE_URL } from '@/utils/constants';
import { authMiddleware } from '@/lib/authMiddleware';
import { customFetch } from '@/lib/customFetch';
import type { paths } from '@/types/openapi';

/**
 * @file API Client Configuration
 *
 * @description
 * Configures an OpenAPI client with custom fetch logic and authentication middleware.
 */

/**
 * API Client
 *
 * @remarks
 * Configures an OpenAPI client targeting the Django backend. The client includes
 * custom fetch logic to handle Content-Length headers and authentication middleware.
 */
const client = createClient<paths>({
  baseUrl: DJANGO_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  Request: undefined,
  fetch: customFetch,
});

// Attach authentication middleware
client.use(authMiddleware);

export default client;
