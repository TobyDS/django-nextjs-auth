// hooks/useApi.ts
'use client';

import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';
import type { paths } from '@/types/openapi';
import { useMemo } from 'react';

const createApiClient = () => {
  const fetchClient = createFetchClient<paths>({
    baseUrl: '/api/proxy',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return createClient(fetchClient);
};

const useApi = () => {
  const client = useMemo(() => createApiClient(), []);
  return client;
};

export default useApi;
