/**
 * @file Custom Fetch Implementation
 *
 * @description
 * A custom implementation of the `fetch` API to ensure compatibility with Django/DRF.
 */

export const customFetch: typeof fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  if (typeof input === 'string' || input instanceof URL) {
    return fetch(input, init);
  }

  if (input instanceof Request) {
    const clonedRequest = input.clone();
    const url = clonedRequest.url;
    const body = clonedRequest.body ? await clonedRequest.text() : undefined;

    const reconstructedInit: RequestInit = {
      method: clonedRequest.method,
      headers: { ...Object.fromEntries(clonedRequest.headers.entries()) },
      body,
    };

    return fetch(url, reconstructedInit);
  }

  throw new TypeError(
    'Invalid input type for customFetch. Expected string, URL, or Request.'
  );
};
