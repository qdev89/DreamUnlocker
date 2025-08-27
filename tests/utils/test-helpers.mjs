import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase-test.mjs';

// Test user management
export async function createTestUser(email = 'test@example.com', password = 'testpass123') {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      // User already exists, sign in instead
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }
    throw error;
  }
}

export async function cleanupTestUser() {
  if (auth.currentUser) {
    const user = auth.currentUser;
    
    // Clean up user's data from Firestore
    await cleanupUserData(user.uid);
    
    // Delete the user account
    await deleteUser(user);
  }
}

export async function signInTestUser(email = 'test@example.com', password = 'testpass123') {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOutTestUser() {
  await signOut(auth);
}

// Firestore test data management
export async function cleanupUserData(userId) {
  const batch = writeBatch(db);
  
  // Clean up user document
  const userRef = doc(db, 'users', userId);
  batch.delete(userRef);
  
  // Clean up user's dreams
  const dreamsQuery = query(collection(db, 'dreams'), where('userId', '==', userId));
  const dreamsSnapshot = await getDocs(dreamsQuery);
  dreamsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Clean up user's interpretations
  const interpretationsQuery = query(collection(db, 'interpretations'), where('userId', '==', userId));
  const interpretationsSnapshot = await getDocs(interpretationsQuery);
  interpretationsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Clean up user's symbol frequencies
  const symbolFreqQuery = query(
    collection(db, 'userSymbolFrequencies'), 
    where('userId', '==', userId)
  );
  const symbolFreqSnapshot = await getDocs(symbolFreqQuery);
  symbolFreqSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

// Test data generators
export function generateTestDream(userId, overrides = {}) {
  return {
    userId,
    title: 'Test Dream',
    description: 'This is a test dream about flying over mountains.',
    dreamDate: Timestamp.fromDate(new Date()),
    createdAt: Timestamp.fromDate(new Date()),
    symbols: ['mountain', 'flying'],
    emotions: ['joy', 'freedom'],
    ...overrides
  };
}

export function generateTestSymbol(overrides = {}) {
  return {
    name: 'Test Symbol',
    archetypalMeaning: 'Test archetypal meaning',
    positiveAspect: 'Test positive aspect',
    negativeAspect: 'Test negative aspect',
    category: 'Nature',
    frequency: 0,
    ...overrides
  };
}

export function generateTestInterpretation(dreamId, overrides = {}) {
  return {
    dreamId,
    overallTheme: 'Test overall theme',
    primaryMessage: 'Test primary message',
    symbolInterpretations: [],
    emotionalInsights: [],
    exploratoryQuestions: ['What does this dream mean to you?'],
    shadowWork: null,
    integrationSuggestion: 'Test integration suggestion',
    integrationSuggestions: ['Test suggestion 1', 'Test suggestion 2'],
    createdAt: Timestamp.fromDate(new Date()),
    ...overrides
  };
}

// Wait for auth state to change
export function waitForAuthStateChange(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error('Auth state change timeout'));
    }, timeout);
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(user);
    });
  });
}

// Sleep utility for tests
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}