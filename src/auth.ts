import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import type { DefaultJWT, JWT } from 'next-auth/jwt';
import client from '@/lib/api';
import type { components } from '@/types/openapi';
import parseCookieExpiry from '@/lib/parseCookieExpiry';

const SECONDS_IN_DAY = 24 * 60 * 60;

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: SECONDS_IN_DAY,
  },
  providers: [
    CredentialsProvider({
      name: 'Django',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          typeof credentials.username !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          return null;
        }

        const { username, password } = credentials;

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

/**
 * Custom types for NextAuth
 *
 * @remarks
 * For some reason this has to be in this file because it will break if it's in a separate file.
 */
declare module 'next-auth' {
  interface Session {
    user: components['schemas']['CustomUserDetails'];
    accessToken: string;
    refreshToken: string;
    expires: string;
  }
  type CustomUserDetails = components['schemas']['CustomUserDetails'];
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
