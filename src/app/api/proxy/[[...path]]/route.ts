import { auth } from '@/auth';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }
  const path = req.nextUrl.pathname.replace('/api/proxy', '');
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `http://localhost:8000${path}${searchParams ? '?' + searchParams : ''}`;
  const headersList = headers();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type':
        (await headersList).get('content-type') || 'application/json',
    },
  });

  return response;
}
