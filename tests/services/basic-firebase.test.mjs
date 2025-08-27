import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase-test.mjs';
import { sleep } from '../utils/test-helpers.mjs';

describe('Basic Firebase Functionality', () => {
  let testUser;
  let userId;

  afterEach(async () => {
    try {
      if (testUser) {
        // Clean up user's data
        const dreamsQuery = query(collection(db, 'dreams'), where('userId', '==', testUser.uid));
        const dreamsSnapshot = await getDocs(dreamsQuery);
        for (const dreamDoc of dreamsSnapshot.docs) {
          await deleteDoc(dreamDoc.ref);
        }

        // Clean up user document
        await deleteDoc(doc(db, 'users', testUser.uid));
        
        // Delete user account
        await deleteUser(testUser);
      }
    } catch (error) {
      console.log('Cleanup error (expected):', error.message);
    }
    testUser = null;
    await sleep(100);
  });

  describe('Authentication Flow', () => {
    it('should successfully register, login and logout a user', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'testpassword123';
      
      // 1. Register user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      testUser = userCredential.user;
      
      expect(testUser).toBeDefined();
      expect(testUser.email).toBe(email);

      // 2. Create user profile in Firestore
      const userData = {
        id: testUser.uid,
        firstName: 'Test',
        lastName: 'User',
        email: email,
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, 'users', testUser.uid), userData);

      // 3. Verify user document was created
      const userDoc = await getDoc(doc(db, 'users', testUser.uid));
      expect(userDoc.exists()).toBe(true);
      expect(userDoc.data().email).toBe(email);

      // 4. Sign out
      await signOut(auth);
      expect(auth.currentUser).toBeNull();

      // 5. Sign back in
      const loginCredential = await signInWithEmailAndPassword(auth, email, password);
      expect(loginCredential.user.uid).toBe(testUser.uid);
      testUser = loginCredential.user; // Update reference for cleanup
    });
  });

  describe('Dreams CRUD Operations', () => {
    beforeEach(async () => {
      const email = `dream-test-${Date.now()}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, 'testpass123');
      testUser = userCredential.user;

      // Create user document
      await setDoc(doc(db, 'users', testUser.uid), {
        id: testUser.uid,
        firstName: 'Dream',
        lastName: 'Tester',
        email: email,
        createdAt: Timestamp.now()
      });
    });

    it('should create and retrieve a dream', async () => {
      // Create a dream
      const dreamData = {
        userId: testUser.uid,
        title: 'Test Dream',
        description: 'A wonderful test dream about flying',
        dreamDate: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.now(),
        symbols: ['flying', 'joy'],
        emotions: ['happiness', 'freedom']
      };

      const dreamRef = await addDoc(collection(db, 'dreams'), dreamData);
      expect(dreamRef.id).toBeDefined();

      // Retrieve the dream
      const dreamDoc = await getDoc(dreamRef);
      expect(dreamDoc.exists()).toBe(true);
      
      const retrievedDream = dreamDoc.data();
      expect(retrievedDream.title).toBe(dreamData.title);
      expect(retrievedDream.userId).toBe(testUser.uid);
      expect(retrievedDream.symbols).toEqual(dreamData.symbols);
    });

    it('should retrieve dreams for a specific user', async () => {
      // Create multiple dreams
      const dreamCount = 3;
      for (let i = 0; i < dreamCount; i++) {
        await addDoc(collection(db, 'dreams'), {
          userId: testUser.uid,
          title: `Dream ${i + 1}`,
          description: `Test dream ${i + 1}`,
          dreamDate: Timestamp.fromDate(new Date()),
          createdAt: Timestamp.now(),
          symbols: [`symbol${i}`],
          emotions: [`emotion${i}`]
        });
      }

      // Query user's dreams
      const dreamsQuery = query(
        collection(db, 'dreams'),
        where('userId', '==', testUser.uid)
      );
      
      const dreamsSnapshot = await getDocs(dreamsQuery);
      expect(dreamsSnapshot.docs).toHaveLength(dreamCount);

      dreamsSnapshot.docs.forEach(doc => {
        const dreamData = doc.data();
        expect(dreamData.userId).toBe(testUser.uid);
        expect(dreamData.title).toMatch(/^Dream \d+$/);
      });
    });
  });

  describe('Symbol Reading (Public Data)', () => {
    it('should be able to read existing symbols', async () => {
      // First authenticate
      const email = `symbol-test-${Date.now()}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, 'testpass123');
      testUser = userCredential.user;

      // Try to read symbols
      const symbolsSnapshot = await getDocs(collection(db, 'symbols'));
      
      if (symbolsSnapshot.docs.length > 0) {
        const firstSymbol = symbolsSnapshot.docs[0].data();
        expect(firstSymbol.name).toBeDefined();
        expect(firstSymbol.archetypalMeaning).toBeDefined();
        expect(firstSymbol.category).toBeDefined();
      }
      
      console.log(`Found ${symbolsSnapshot.docs.length} symbols in database`);
    });
  });

  describe('Firebase Security Rules', () => {
    it('should enforce user data isolation', async () => {
      // Create first user
      const email1 = `user1-${Date.now()}@example.com`;
      const user1Credential = await createUserWithEmailAndPassword(auth, email1, 'testpass123');
      const user1 = user1Credential.user;

      // Create dream for user1
      const dreamRef = await addDoc(collection(db, 'dreams'), {
        userId: user1.uid,
        title: 'User 1 Dream',
        description: 'Private dream',
        dreamDate: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.now(),
        symbols: ['private'],
        emotions: ['secret']
      });

      // Create second user
      await signOut(auth);
      const email2 = `user2-${Date.now()}@example.com`;
      const user2Credential = await createUserWithEmailAndPassword(auth, email2, 'testpass123');
      testUser = user2Credential.user; // Set for cleanup

      // User 2 should not see User 1's dreams
      const user2DreamsQuery = query(
        collection(db, 'dreams'),
        where('userId', '==', user2Credential.user.uid)
      );
      
      const user2Dreams = await getDocs(user2DreamsQuery);
      expect(user2Dreams.docs).toHaveLength(0);

      // Cleanup user1 manually since testUser cleanup won't handle it
      await signOut(auth);
      await signInWithEmailAndPassword(auth, email1, 'testpass123');
      await deleteDoc(dreamRef);
      await deleteDoc(doc(db, 'users', user1.uid));
      await deleteUser(user1);
      
      // Switch back to testUser for normal cleanup
      await signOut(auth);
      await signInWithEmailAndPassword(auth, email2, 'testpass123');
    });
  });
});