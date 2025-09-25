import { set, get, del } from 'idb-keyval';

const SESSION_KEY = 'user-session';

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

export interface Session {
  user: User;
  token: string; // Mock token
}

/**
 * Simulates a login request to a backend.
 */
export const login = async (username, password): Promise<Session | null> => {
  // Mock user database
  const users = {
    user: { id: 'user-123', username: 'user', role: 'user', password: 'user' },
    teste: { id: 'user-789', username: 'teste', role: 'user', password: 'teste' },
    admin: { id: 'admin-456', username: 'admin', role: 'admin', password: 'admin' },
  };

  const key = String(username || '').trim().toLowerCase();
  const providedPassword = String(password || '').trim();
  const user = users[key];
  if (user && user.password === providedPassword) {
    const session: Session = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token: `mock-token-${Date.now()}`,
    };
    await set(SESSION_KEY, session);
    return session;
  }

  return null;
};

/**
 * Logs the user out by deleting their session from IndexedDB.
 */
export const logout = async (): Promise<void> => {
  await del(SESSION_KEY);
};

/**
 * Retrieves the current user session from IndexedDB.
 */
export const getSession = async (): Promise<Session | undefined> => {
  return await get(SESSION_KEY);
};
