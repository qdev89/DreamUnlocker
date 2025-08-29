import dotenv from 'dotenv';
import { auth } from './config/firebase-test.mjs';
import { signOut } from 'firebase/auth';

// Load environment variables
dotenv.config();

// Global test setup
export async function setup() {
  console.log('Setting up Firebase tests...');
  
  // Ensure we start with a clean auth state
  if (auth.currentUser) {
    await signOut(auth);
  }
  
  console.log('Firebase test setup complete');
}

// Global test teardown
export async function teardown() {
  console.log('Tearing down Firebase tests...');
  
  // Sign out any authenticated users
  if (auth.currentUser) {
    await signOut(auth);
  }
  
  console.log('Firebase test teardown complete');
}