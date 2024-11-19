import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { BaseUser } from './app/types/next-auth';
import createClient from 'openapi-fetch';
import type { paths } from './app/types/openapi';

const client = createClient<paths>({
  baseUrl: 'http://localhost:8000',
});

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Django',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Type guard for credentials
          if (
            typeof credentials.username !== 'string' ||
            typeof credentials.password !== 'string'
          ) {
            console.error('Invalid credentials:', credentials);
            return null;
          }

          const { data, error, response } = await client.POST('/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
              username: credentials.username,
              password: credentials.password,
            },
          });

          if (error) {
            console.error('Response not OK: ', error);
            return null;
          }

          // Access cookies using Next.js cookies API
          const cookies = response.headers.get('set-cookie');

          const accessToken = cookies?.match(/access_token=([^;]+)/)?.[1];
          const refreshToken = cookies?.match(/refresh_token=([^;]+)/)?.[1];

          if (!accessToken || !refreshToken) {
            console.error('Tokens not found in cookies: ', cookies);
            return null;
          }

          return {
            id: String(data.user.pk),
            ...data.user,
            accessToken,
            refreshToken,
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
        token.user = {
          id: (user as BaseUser).id,
          username: (user as BaseUser).username,
          email: (user as BaseUser).email,
          first_name: (user as BaseUser).first_name,
          last_name: (user as BaseUser).last_name,
          groups: (user as BaseUser).groups,
          full_name: (user as BaseUser).full_name,
          emailVerified: (user as BaseUser).emailVerified,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as BaseUser;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
