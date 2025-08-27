import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-test.mjs';
import { 
  createTestUser, 
  cleanupTestUser, 
  signOutTestUser,
  waitForAuthStateChange,
  sleep 
} from '../utils/test-helpers.mjs';

// Import the service class and recreate it with test config
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc as firestoreDoc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Create AuthService class with test config
class FirebaseAuthService {
  async register(data) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName} ${data.lastName}`
      });
      
      const userData = {
        id: firebaseUser.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now()
      };
      
      await setDoc(firestoreDoc(db, 'users', firebaseUser.uid), userData);
      
      return this.mapFirebaseUserToAuthUser(userData);
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }
  
  async login(data) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      await updateDoc(firestoreDoc(db, 'users', firebaseUser.uid), {
        lastLoginAt: Timestamp.now()
      });
      
      const userDoc = await getDoc(firestoreDoc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
      
      return this.mapFirebaseUserToAuthUser(userDoc.data());
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }
  
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }
  
  async getCurrentUser() {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    try {
      const userDoc = await getDoc(firestoreDoc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;
      
      return this.mapFirebaseUserToAuthUser(userDoc.data());
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }
  
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(firestoreDoc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const authUser = this.mapFirebaseUserToAuthUser(userDoc.data());
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
  
  mapFirebaseUserToAuthUser(firebaseUser) {
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

const authService = new FirebaseAuthService();

describe('Firebase Auth Service', () => {
  const testEmail = 'authtest@example.com';
  const testPassword = 'testpass123';
  const testUserData = {
    email: testEmail,
    password: testPassword,
    firstName: 'Auth',
    lastName: 'Test'
  };

  beforeEach(async () => {
    // Ensure we start with clean slate
    await signOutTestUser();
    await sleep(100);
  });

  afterEach(async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        
        // Clean up user document
        await deleteDoc(doc(db, 'users', userId));
        
        // Delete user account
        await deleteUser(auth.currentUser);
      }
    } catch (error) {
      console.log('Cleanup error (expected):', error.message);
    }
    await sleep(100);
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const user = await authService.register(testUserData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.firstName).toBe(testUserData.firstName);
      expect(user.lastName).toBe(testUserData.lastName);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should fail registration with invalid email', async () => {
      const invalidData = { ...testUserData, email: 'invalid-email' };
      
      await expect(authService.register(invalidData))
        .rejects.toThrow();
    });

    it('should fail registration with weak password', async () => {
      const weakPasswordData = { ...testUserData, password: '123' };
      
      await expect(authService.register(weakPasswordData))
        .rejects.toThrow();
    });
  });

  describe('User Login', () => {
    it('should successfully login with valid credentials', async () => {
      // First register the user
      await authService.register(testUserData);
      await signOutTestUser();
      
      // Then login
      const user = await authService.login({
        email: testEmail,
        password: testPassword
      });
      
      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
    });

    it('should fail login with invalid credentials', async () => {
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow();
    });
  });

  describe('User Logout', () => {
    it('should successfully logout user', async () => {
      await authService.register(testUserData);
      
      expect(auth.currentUser).not.toBeNull();
      
      await authService.logout();
      
      expect(auth.currentUser).toBeNull();
    });
  });

  describe('Get Current User', () => {
    it('should return current user when logged in', async () => {
      const registeredUser = await authService.register(testUserData);
      
      const currentUser = await authService.getCurrentUser();
      
      expect(currentUser).toBeDefined();
      expect(currentUser?.id).toBe(registeredUser.id);
      expect(currentUser?.email).toBe(registeredUser.email);
    });

    it('should return null when not logged in', async () => {
      await signOutTestUser();
      
      const currentUser = await authService.getCurrentUser();
      
      expect(currentUser).toBeNull();
    });
  });

  describe('Auth State Changes', () => {
    it('should notify when user logs in', async () => {
      let receivedUser = null;
      let callbackCalled = false;
      
      const unsubscribe = authService.onAuthStateChange((user) => {
        receivedUser = user;
        callbackCalled = true;
      });
      
      await authService.register(testUserData);
      
      // Wait for callback
      await sleep(1000);
      
      expect(callbackCalled).toBe(true);
      expect(receivedUser).toBeDefined();
      expect(receivedUser?.email).toBe(testEmail);
      
      unsubscribe();
    });

    it('should notify when user logs out', async () => {
      const receivedUsers = [];
      
      const unsubscribe = authService.onAuthStateChange((user) => {
        receivedUsers.push(user);
      });
      
      await authService.register(testUserData);
      await sleep(500);
      
      await authService.logout();
      await sleep(500);
      
      expect(receivedUsers.length).toBeGreaterThan(1);
      expect(receivedUsers[receivedUsers.length - 1]).toBeNull();
      
      unsubscribe();
    });
  });
});