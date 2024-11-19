'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * A custom hook for fetching data from an API with proper loading,
 * error handling, and support for authenticated requests.
 *
 * @template T - The expected type of the response data.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @param {AxiosRequestConfig} [options={}] - Optional Axios configuration for the request.
 * @returns {ApiResponse<T>} - The API response state, including `data`, `loading`, `error`, and a `refetch` function.
 */
export function useApi<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): ApiResponse<T> {
  const { data: session, status } = useSession(); // Use status to check session hydration
  const [state, setState] = useState<ApiState<T>>({
    loading: true,
    data: null,
    error: null,
  });

  const optionsRef = useRef(options);
  const endpointRef = useRef(endpoint);
  const mounted = useRef(true);
  const isFetching = useRef(false);

  // Track component mount state to avoid setting state on unmounted components
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Sync updated options and endpoint with refs
  useEffect(() => {
    optionsRef.current = options;
    endpointRef.current = endpoint;
  }, [options, endpoint]);

  const fetchData = async () => {
    if (isFetching.current || status === 'loading') return; // Wait for session to hydrate
    isFetching.current = true;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    if (!session?.accessToken) {
      setState({
        data: null,
        loading: false,
        error: 'No access token available.',
      });
      isFetching.current = false;
      return;
    }

    try {
      const response = await axios({
        ...optionsRef.current,
        url: `${process.env.NEXT_PUBLIC_API_URL}${endpointRef.current}`,
        headers: {
          ...optionsRef.current.headers,
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (mounted.current) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (mounted.current) {
        const error = err as Error | AxiosError;
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.detail || error.message
          : error.message;

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
      }
    } finally {
      isFetching.current = false;
    }
  };

  /**
   * Fetch data only when session is authenticated.
   * This prevents incorrectly showing 'no access token' error before session is hydrated.
   */
  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, session?.accessToken]);

  return {
    ...state,
    refetch: fetchData,
  };
}
