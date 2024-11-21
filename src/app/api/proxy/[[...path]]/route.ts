import { auth } from '@/auth';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

const authorizeRequest = async (req: NextRequest, method = 'GET') => {
  const session = await auth();
  if (!session?.accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }
  const path = req.nextUrl.pathname.replace('/api/proxy', '');
  const searchParams = req.nextUrl.searchParams.toString();

  // Ensure the path ends with a trailing slash if necessary
  const formattedPath = path.endsWith('/') ? path : `${path}/`;

  // Get the body correctly
  let body = null;
  if (req.body) {
    const text = await req.text();
    body = text; // Don't stringify again, it's already a string
  }

  const url = `http://localhost:8000${formattedPath}${searchParams ? '?' + searchParams : ''}`;
  const headersList = headers();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type':
        (await headersList).get('content-type') || 'application/json',
    },
    method,
    body,
  });
  return response;
};

export async function GET(req: NextRequest) {
  const response = await authorizeRequest(req);
  return response;
}

export async function PUT(req: NextRequest) {
  const response = await authorizeRequest(req, 'PUT');
  return response;
}
