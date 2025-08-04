import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { firebaseAuthService } from '../services/firebase/authService';
import type { User, RegisterData, LoginData } from '../services/firebase/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await firebaseAuthService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginData): Promise<void> => {
    try {
      const userData = await firebaseAuthService.login(credentials);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const newUser = await firebaseAuthService.register(userData);
      setUser(newUser);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseAuthService.logout();
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await firebaseAuthService.resetPassword(email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
