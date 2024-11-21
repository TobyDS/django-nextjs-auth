import { auth } from '@/auth';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { DJANGO_API_BASE_URL } from '@/utils/constants';

const authorizeRequest = async (req: NextRequest) => {
  const session = await auth();
  if (!session?.accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const path = req.nextUrl.pathname.replace('/api/proxy', '');
  const formattedPath = path.endsWith('/') ? path : `${path}/`;
  const searchParams = req.nextUrl.searchParams.toString();

  let body = null;
  if (req.body) {
    const text = await req.text();
    body = text;
  }

  const url = `${DJANGO_API_BASE_URL}${formattedPath}${searchParams ? '?' + searchParams : ''}`;
  const headersList = headers();

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type':
        (await headersList).get('content-type') || 'application/json',
    },
    method: req.method,
    body,
  });
};

// Handle all methods
export const GET = authorizeRequest;
export const PUT = authorizeRequest;
export const POST = authorizeRequest;
export const DELETE = authorizeRequest;
export const PATCH = authorizeRequest;
export const OPTIONS = authorizeRequest;
export const HEAD = authorizeRequest;
export const TRACE = authorizeRequest;
