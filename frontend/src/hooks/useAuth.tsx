
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '@/lib/types';
import { authApi } from '@/services/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, error: "No token received" };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: "Registration successful but no token received" };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
