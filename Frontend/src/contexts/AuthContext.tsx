import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    country: string;
    currency: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting login process...');
      const response = await authAPI.login({ email, password });
      console.log('📥 Login response received:', response);
      
      if (response && response.user) {
        console.log('✅ User data found, setting user:', response.user);
        setUser(response.user);
        return response.user;
      } else if (response && response.data && response.data.user) {
        console.log('✅ User data found in response.data.user:', response.data.user);
        setUser(response.data.user);
        return response.data.user;
      } else {
        console.error('❌ No user data in response:', response);
        throw new Error('Invalid response from server - no user data found');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    country: string;
    currency: string;
  }) => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting signup process...');
      const response = await authAPI.signup(userData);
      console.log('📥 Signup response received:', response);
      
      if (response && response.user) {
        console.log('✅ User data found, setting user:', response.user);
        setUser(response.user);
      } else if (response && response.data && response.data.user) {
        console.log('✅ User data found in response.data.user:', response.data.user);
        setUser(response.data.user);
      } else {
        console.error('❌ No user data in response:', response);
        console.error('❌ Response structure:', {
          hasResponse: !!response,
          hasUser: !!(response && response.user),
          hasData: !!(response && response.data),
          hasDataUser: !!(response && response.data && response.data.user),
          responseKeys: response ? Object.keys(response) : 'No response'
        });
        throw new Error('Invalid response from server - no user data found');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
