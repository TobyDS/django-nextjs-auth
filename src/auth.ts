import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import type { NextAuthConfig } from 'next-auth';
import type { BaseUser } from './app/types/next-auth';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Django',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const response = await fetch(`http://localhost:8000/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.error(
              'Response not OK:',
              response.status,
              response.statusText
            );
            return null;
          }

          // Access cookies using Next.js cookies API
          const parsedCookies = cookies();
          const accessToken =
            (await parsedCookies).get('access_token')?.value || null;
          const refreshToken =
            (await parsedCookies).get('refresh_token')?.value || null;

          const data = await response.json();

          if (!accessToken || !refreshToken) {
            console.error('Tokens not found in cookies:', parsedCookies);
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
