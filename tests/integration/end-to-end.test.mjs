import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createUserWithEmailAndPassword,
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
  orderBy,
  getDocs,
  Timestamp, 
  writeBatch 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase-test.mjs';
import { 
  createTestUser, 
  cleanupUserData,
  signOutTestUser,
  sleep 
} from '../utils/test-helpers.mjs';

// Import all services for integration testing
// Note: In a real scenario, you'd import the actual services from the frontend
// For this test, we'll use simplified versions that match the service interfaces

// Mock services for integration testing
const createMockServices = () => {
  const mockAuthService = {
    async register(data) {
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
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return { ...userData, createdAt: userData.createdAt.toDate(), lastLoginAt: userData.lastLoginAt.toDate() };
    },

    async getCurrentUser() {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate()
      };
    }
  };

  const mockDreamsService = {
    async createDream(userId, dreamData) {
      const firebaseDream = {
        userId,
        title: dreamData.title,
        description: dreamData.description,
        dreamDate: Timestamp.fromDate(dreamData.dreamDate),
        createdAt: Timestamp.now(),
        symbols: dreamData.symbols || [],
        emotions: dreamData.emotions || []
      };
      
      const docRef = await addDoc(collection(db, 'dreams'), firebaseDream);
      
      return {
        id: docRef.id,
        userId: firebaseDream.userId,
        title: firebaseDream.title,
        description: firebaseDream.description,
        dreamDate: firebaseDream.dreamDate.toDate(),
        createdAt: firebaseDream.createdAt.toDate(),
        symbols: firebaseDream.symbols,
        emotions: firebaseDream.emotions
      };
    },

    async getUserDreams(userId) {
      const q = query(
        collection(db, 'dreams'),
        where('userId', '==', userId),
        orderBy('dreamDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dreamDate: data.dreamDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
    }
  };

  const mockInterpretationsService = {
    async createInterpretation(dreamId, data) {
      const interpretationData = {
        dreamId,
        overallTheme: 'Integration Test Theme',
        primaryMessage: 'This dream represents personal growth',
        symbolInterpretations: [],
        emotionalInsights: [],
        exploratoryQuestions: ['What growth are you experiencing?'],
        shadowWork: null,
        integrationSuggestion: 'Embrace the changes in your life',
        integrationSuggestions: ['Embrace the changes in your life'],
        personalReflections: data.personalReflections || '',
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, 'interpretations', dreamId), interpretationData);

      return {
        id: dreamId,
        ...interpretationData,
        createdAt: interpretationData.createdAt.toDate()
      };
    },

    async getInterpretationByDreamId(dreamId) {
      const interpretationDoc = await getDoc(doc(db, 'interpretations', dreamId));
      
      if (!interpretationDoc.exists()) {
        return null;
      }
      
      const data = interpretationDoc.data();
      return {
        id: interpretationDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
  };

  return {
    authService: mockAuthService,
    dreamsService: mockDreamsService,
    interpretationsService: mockInterpretationsService
  };
};

describe('End-to-End Integration Tests', () => {
  let testUser;
  let userId;
  let services;

  beforeEach(async () => {
    await signOutTestUser();
    services = createMockServices();
    await sleep(100);
  });

  afterEach(async () => {
    try {
      if (userId) {
        await cleanupUserData(userId);
      }
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
    } catch (error) {
      console.log('Cleanup error (expected):', error.message);
    }
    await sleep(100);
  });

  describe('Complete User Journey', () => {
    it('should handle complete dream analysis workflow', async () => {
      // 1. User Registration
      const registrationData = {
        email: 'integration@test.com',
        password: 'integrationtest123',
        firstName: 'Integration',
        lastName: 'Test'
      };

      const user = await services.authService.register(registrationData);
      userId = user.id;

      expect(user).toBeDefined();
      expect(user.email).toBe(registrationData.email);
      expect(user.firstName).toBe(registrationData.firstName);

      // 2. Verify user is properly authenticated
      const currentUser = await services.authService.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser.id).toBe(user.id);

      // 3. Create a dream
      const dreamData = {
        title: 'Integration Test Dream',
        description: 'A complex dream about transformation and growth, featuring flying over a vast ocean under starlight',
        dreamDate: new Date(),
        symbols: ['flying', 'ocean', 'stars', 'transformation'],
        emotions: ['wonder', 'peace', 'excitement']
      };

      const dream = await services.dreamsService.createDream(userId, dreamData);

      expect(dream).toBeDefined();
      expect(dream.id).toBeDefined();
      expect(dream.userId).toBe(userId);
      expect(dream.title).toBe(dreamData.title);
      expect(dream.symbols).toEqual(dreamData.symbols);
      expect(dream.emotions).toEqual(dreamData.emotions);

      // 4. Get user's dreams to verify it was saved
      const userDreams = await services.dreamsService.getUserDreams(userId);
      expect(userDreams).toHaveLength(1);
      expect(userDreams[0].id).toBe(dream.id);

      // 5. Create interpretation for the dream
      const interpretationData = {
        personalReflections: 'This dream felt deeply meaningful and represented my current life transition'
      };

      const interpretation = await services.interpretationsService.createInterpretation(
        dream.id,
        interpretationData
      );

      expect(interpretation).toBeDefined();
      expect(interpretation.dreamId).toBe(dream.id);
      expect(interpretation.overallTheme).toBeDefined();
      expect(interpretation.primaryMessage).toBeDefined();
      expect(interpretation.personalReflections).toBe(interpretationData.personalReflections);

      // 6. Retrieve the interpretation to verify it was saved
      const retrievedInterpretation = await services.interpretationsService.getInterpretationByDreamId(dream.id);
      expect(retrievedInterpretation).toBeDefined();
      expect(retrievedInterpretation.id).toBe(interpretation.id);
      expect(retrievedInterpretation.overallTheme).toBe(interpretation.overallTheme);

      // 7. Verify the complete data relationships
      expect(retrievedInterpretation.dreamId).toBe(dream.id);
      expect(dream.userId).toBe(currentUser.id);
    });

    it('should handle multiple dreams and interpretations', async () => {
      // Register user
      const user = await services.authService.register({
        email: 'multipletest@test.com',
        password: 'multipletest123',
        firstName: 'Multiple',
        lastName: 'Test'
      });
      userId = user.id;

      // Create multiple dreams
      const dreamCount = 3;
      const dreams = [];
      const interpretations = [];

      for (let i = 1; i <= dreamCount; i++) {
        const dreamData = {
          title: `Test Dream ${i}`,
          description: `This is test dream number ${i} with unique content`,
          dreamDate: new Date(Date.now() - i * 86400000), // Different dates
          symbols: [`symbol${i}`, 'common-symbol'],
          emotions: [`emotion${i}`, 'wonder']
        };

        const dream = await services.dreamsService.createDream(userId, dreamData);
        dreams.push(dream);

        // Create interpretation for each dream
        const interpretation = await services.interpretationsService.createInterpretation(dream.id, {
          personalReflections: `Reflections for dream ${i}`
        });
        interpretations.push(interpretation);
      }

      // Verify all dreams were created
      const userDreams = await services.dreamsService.getUserDreams(userId);
      expect(userDreams).toHaveLength(dreamCount);

      // Verify all interpretations exist
      for (const dream of dreams) {
        const interpretation = await services.interpretationsService.getInterpretationByDreamId(dream.id);
        expect(interpretation).toBeDefined();
        expect(interpretation.dreamId).toBe(dream.id);
      }

      // Verify dreams are ordered by date (newest first)
      for (let i = 1; i < userDreams.length; i++) {
        expect(userDreams[i-1].dreamDate >= userDreams[i].dreamDate).toBe(true);
      }
    });

    it('should handle error cases gracefully', async () => {
      // 1. Try to create dream for non-existent user
      await expect(services.dreamsService.createDream('non-existent-user', {
        title: 'Test',
        description: 'Test',
        dreamDate: new Date()
      })).resolves.toBeDefined(); // This should still work as we're just setting userId

      // 2. Try to get interpretation for non-existent dream
      const interpretation = await services.interpretationsService.getInterpretationByDreamId('non-existent-dream');
      expect(interpretation).toBeNull();

      // 3. Get dreams for non-existent user (should return empty array)
      const dreams = await services.dreamsService.getUserDreams('non-existent-user');
      expect(dreams).toEqual([]);
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain referential integrity between dreams and interpretations', async () => {
      // Register user and create dream
      const user = await services.authService.register({
        email: 'consistency@test.com',
        password: 'consistencytest123',
        firstName: 'Consistency',
        lastName: 'Test'
      });
      userId = user.id;

      const dream = await services.dreamsService.createDream(userId, {
        title: 'Consistency Test Dream',
        description: 'Testing data consistency',
        dreamDate: new Date(),
        symbols: ['consistency', 'testing'],
        emotions: ['confidence', 'focus']
      });

      // Create interpretation
      const interpretation = await services.interpretationsService.createInterpretation(dream.id, {
        personalReflections: 'Testing consistency between dream and interpretation'
      });

      // Verify the relationship
      expect(interpretation.dreamId).toBe(dream.id);
      expect(interpretation.id).toBe(dream.id); // Interpretation uses dreamId as its ID

      // Verify we can traverse the relationship
      const retrievedInterpretation = await services.interpretationsService.getInterpretationByDreamId(dream.id);
      expect(retrievedInterpretation).toBeDefined();
      expect(retrievedInterpretation.dreamId).toBe(dream.id);
    });

    it('should handle concurrent operations correctly', async () => {
      // Register user
      const user = await services.authService.register({
        email: 'concurrent@test.com',
        password: 'concurrenttest123',
        firstName: 'Concurrent',
        lastName: 'Test'
      });
      userId = user.id;

      // Create multiple dreams concurrently
      const dreamPromises = [];
      for (let i = 1; i <= 3; i++) {
        dreamPromises.push(services.dreamsService.createDream(userId, {
          title: `Concurrent Dream ${i}`,
          description: `Dream ${i} created concurrently`,
          dreamDate: new Date(),
          symbols: [`concurrent${i}`],
          emotions: ['excitement']
        }));
      }

      const dreams = await Promise.all(dreamPromises);
      expect(dreams).toHaveLength(3);

      // Verify all dreams have unique IDs
      const dreamIds = dreams.map(d => d.id);
      const uniqueIds = new Set(dreamIds);
      expect(uniqueIds.size).toBe(3);

      // Create interpretations concurrently
      const interpretationPromises = dreams.map(dream => 
        services.interpretationsService.createInterpretation(dream.id, {
          personalReflections: `Concurrent reflection for ${dream.title}`
        })
      );

      const interpretations = await Promise.all(interpretationPromises);
      expect(interpretations).toHaveLength(3);

      // Verify all interpretations were created correctly
      for (const interpretation of interpretations) {
        expect(interpretation.dreamId).toBeDefined();
        const correspondingDream = dreams.find(d => d.id === interpretation.dreamId);
        expect(correspondingDream).toBeDefined();
      }
    });
  });
});