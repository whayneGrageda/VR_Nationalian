import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserFriendlyError } from '../utils/errorHandler';

interface User {
  userId: string;
  username: string;
  roleId: number;
  roleName: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  sessionToken?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    
    // Store user data in multiple formats for compatibility
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Store JWT token if available
    if (userData.sessionToken) {
      localStorage.setItem('jwt_token', userData.sessionToken);
    }
  };

  const logout = async () => {
    // Call backend to deactivate session
    const sessionToken = user?.sessionToken;
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken })
        });
      } catch (error) {
        console.error('Logout error:', getUserFriendlyError(error));
        // Continue with logout even if API call fails
      }
    }

    setUser(null);
    
    // Remove all auth-related items from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('sessionToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
