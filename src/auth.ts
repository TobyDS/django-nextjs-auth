import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { DefaultJWT, JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import client from '@/lib/api';
import type { components } from './app/types/openapi';

type CustomUserDetails = components['schemas']['CustomUserDetails'];

export function getSessionSafe<T extends Session>(
  session: T | null
): Omit<T, 'accessToken' | 'refreshToken'> | null {
  if (!session) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessToken, refreshToken, ...safeSession } = session;
  return safeSession;
}

interface Credentials {
  username: string;
  password: string;
}

declare module 'next-auth' {
  interface Session {
    user: CustomUserDetails;
    accessToken: string;
    refreshToken: string;
    expires: string;
  }
  interface User extends CustomUserDetails {
    accessToken: string;
    refreshToken: string;
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: components['schemas']['CustomUserDetails'];
    accessToken: string;
    refreshToken: string;
    expires: string;
  }
}

const parseCookieExpiry = (cookies: string | null): string | null => {
  const match = cookies?.match(/access_token=[^;]+;\s*expires=([^;]+)/);
  if (!match) return null;

  const expiryDate = new Date(match[1]);
  if (isNaN(expiryDate.getTime())) return null;

  return expiryDate.toISOString();
};

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Django',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials as Credentials;
        if (!username || !password) return null;

        try {
          const { data, error, response } = await client.POST('/auth/login/', {
            body: {
              username: username,
              password: password,
            },
          });

          if (error) {
            console.error(
              'Response not OK:',
              response,
              'Error details:',
              error
            );
            return null;
          }

          const cookies = response.headers.get('set-cookie');

          const accessToken = cookies?.match(/access_token=([^;]+)/)?.[1];
          const refreshToken = cookies?.match(/refresh_token=([^;]+)/)?.[1];
          const expires = parseCookieExpiry(cookies);

          if (!accessToken || !refreshToken || !expires) {
            console.error('Token or expiry not found in cookies: ', cookies);
            return null;
          }

          return {
            ...data.user,
            email: data.user.email ?? '',
            accessToken,
            refreshToken,
            expires,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expires = user.expires;
        token.user = {
          pk: user.pk,
          username: user.username,
          email: user.email || '',
          first_name: user.first_name,
          last_name: user.last_name,
          groups: user.groups,
          full_name: user.full_name,
        };
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expires = token.expires;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
