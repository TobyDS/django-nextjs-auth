import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

type SafeSession = Omit<Session, 'accessToken' | 'refreshToken'>;

interface SafeSessionContextValue {
  data: SafeSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: (data?: unknown) => Promise<SafeSession | null>;
}

/**
 * Custom hook to provide a safe session context value.
 * This hook omits the accessToken and refreshToken from the session data.
 *
 * @returns {SafeSessionContextValue} The safe session context value.
 */
function useSafeSession(): SafeSessionContextValue {
  const { data: session, status, update } = useSession();

  const safeSession = session
    ? ({
        ...session,
        accessToken: undefined,
        refreshToken: undefined,
      } as SafeSession)
    : null;

  /**
   * Updates the session data and omits the accessToken and refreshToken.
   *
   * @param {unknown} [data] - The data to update the session with.
   * @returns {Promise<SafeSession | null>} The updated safe session data.
   */
  const safeUpdate = async (data: unknown) => {
    const updatedSession = await update(data);
    if (!updatedSession) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, refreshToken, ...safe } = updatedSession;
    return safe as SafeSession;
  };

  return {
    data: safeSession,
    status,
    update: safeUpdate,
  };
}

export default useSafeSession;
