import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import type { FirebaseUser, AuthError } from '../../types/firebase';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

class FirebaseAuthService {
  // Helper method to create readable error messages
  private getReadableErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in or use a different email.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
      'permission-denied': 'You do not have permission to access this resource.',
      'unavailable': 'The service is currently unavailable. Please try again later.'
    };
    
    return errorMessages[code] || 'An unexpected error occurred. Please try again.';
  }

  // Helper method to create AuthError from Firebase error
  private createAuthError(error: any, email?: string): AuthError {
    const authError: AuthError = {
      code: error.code || 'unknown',
      message: this.getReadableErrorMessage(error.code || 'unknown')
    };
    
    if (email) {
      authError.email = email;
    }
    
    return authError;
  }
  // Register new user
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName} ${data.lastName}`
      });
      
      // Create user document in Firestore
      const userData: FirebaseUser = {
        id: firebaseUser.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return this.mapFirebaseUserToAuthUser(userData);
    } catch (error: any) {
      throw this.createAuthError(error, data.email);
    }
  }
  
  // Login user
  async login(data: LoginData): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: Timestamp.now()
      });
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
      
      return this.mapFirebaseUserToAuthUser(userDoc.data() as FirebaseUser);
    } catch (error: any) {
      throw this.createAuthError(error, data.email);
    }
  }
  
  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.createAuthError(error);
    }
  }
  
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;
      
      return this.mapFirebaseUserToAuthUser(userDoc.data() as FirebaseUser);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.createAuthError(error, email);
    }
  }
  
  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const authUser = this.mapFirebaseUserToAuthUser(userDoc.data() as FirebaseUser);
            callback(authUser);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
  
  // Helper method to map Firebase user to AuthUser
  private mapFirebaseUserToAuthUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      id: firebaseUser.id,
      email: firebaseUser.email,
      firstName: firebaseUser.firstName,
      lastName: firebaseUser.lastName,
      createdAt: firebaseUser.createdAt.toDate(),
      lastLoginAt: firebaseUser.lastLoginAt?.toDate()
    };
  }
}

export const firebaseAuthService = new FirebaseAuthService();
