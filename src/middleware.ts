// middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth(async (req) => {
  // // Skip auth check for proxy routes
  // if (req.nextUrl.pathname.startsWith('/api/auth')) {
  //   return NextResponse.next();
  // }
  // // Protect other routes
  // if (!req.auth) {
  //   return Response.redirect(new URL('/api/auth/signin', req.url));
  // }
  // return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/((?!api)*/)'],
};
