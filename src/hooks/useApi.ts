// hooks/useApi.ts
'use client';

import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';
import type { paths } from '@/types/openapi';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const createApiClient = () => {
  const fetchClient = createFetchClient<paths>({
    baseUrl: '/api/proxy',
  });

  return createClient(fetchClient);
};

export const useApi = () => {
  const queryClient = useQueryClient();
  const client = useMemo(() => createApiClient(), []);
  return { ...client, queryClient };
};

export default useApi;
