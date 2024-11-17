import 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: BaseUser; // Use BaseUser for session user
  }

  interface User extends BaseUser {
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    user?: BaseUser;
  }
}

export interface BaseUser extends AdapterUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  groups: string[];
  emailVerified: Date | null; // Ensure emailVerified is optional or nullable
}
