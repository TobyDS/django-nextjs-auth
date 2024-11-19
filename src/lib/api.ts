import { auth } from '@/auth';

import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@/app/types/openapi';

const client = createClient<paths>({
  baseUrl: 'http://localhost:8000',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  // Override the default Request constructor usage
  Request: undefined,
  // Override the default fetch usage. Using signature `fetch(new Request(...))`
  // causes `Transfer-Encoding: chunked` and no `Content-Length` in request headers
  // which doesn't work with Django/DRF API
  fetch: async (input: Request) => {
    const url = input.url;
    const body = input.body ? await input.text() : undefined;
    const init = {
      method: input.method,
      headers: Object.fromEntries(input.headers.entries()),
      body,
    };
    return fetch(url, init);
  },
});

let accessToken: string | undefined = undefined;

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // fetch token, if it doesn’t exist
    if (!accessToken) {
      const session = await auth();
      if (session && session.accessToken) {
        accessToken = session.accessToken;
      } else {
        // handle auth error
      }
    }

    // (optional) add logic here to refresh token when it expires

    // add Authorization header to every request
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
};

client.use(authMiddleware);

export default client;
