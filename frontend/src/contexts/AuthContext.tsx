import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import { getStoredToken, getStoredUser, setAuthData, clearAuthData } from '../lib/auth';
import { api } from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const token = getStoredToken();
    const storedUser = getStoredUser();
    
    if (token && storedUser) {
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const { token, userId, email, firstName, lastName } = response.data;

      // Convert backend response to frontend User format
      const userData: User = {
        id: userId,
        email,
        firstName,
        lastName
      };

      setAuthData(token, userData);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      const { token, userId, email, firstName, lastName } = response.data;

      // Convert backend response to frontend User format
      const newUser: User = {
        id: userId,
        email,
        firstName,
        lastName
      };

      setAuthData(token, newUser);
      setUser(newUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = (): void => {
    clearAuthData();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
