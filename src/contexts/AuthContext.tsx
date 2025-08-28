import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, login as apiLogin, logout as apiLogout, Session, User } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username, password) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      try {
        const session = await getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Failed to get session", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (username, password) => {
    const session = await apiLogin(username, password);
    if (session) {
      setUser(session.user);
      if (session.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
