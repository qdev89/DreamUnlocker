import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db, auth } from '../config/firebase-test.mjs';
import { 
  createTestUser, 
  cleanupUserData,
  generateTestDream,
  generateTestInterpretation,
  signOutTestUser,
  sleep 
} from '../utils/test-helpers.mjs';

// Mock interpretation engine
const mockInterpretationEngine = {
  generateInterpretation: async (userId, dream, includeShadowWork) => {
    return {
      overallTheme: 'Test Overall Theme',
      primaryMessage: 'Test Primary Message',
      symbolInterpretations: [
        {
          symbol: 'flying',
          meaning: 'Represents freedom and liberation'
        }
      ],
      emotionalInsights: [
        {
          emotion: 'joy',
          insight: 'This emotion suggests positive transformation'
        }
      ],
      exploratoryQuestions: [
        'What does freedom mean to you in your current life situation?',
        'How can you embrace this sense of liberation in your daily life?'
      ],
      shadowWork: includeShadowWork ? {
        challenges: 'Fear of losing control',
        integration: 'Practice grounding techniques'
      } : null,
      integrationSuggestion: 'Consider ways to incorporate more freedom into your daily routine'
    };
  }
};

// Create DreamsService mock for interpretations service
const mockDreamsService = {
  getDreamById: async (dreamId) => {
    const dreamDoc = await getDoc(doc(db, 'dreams', dreamId));
    if (!dreamDoc.exists()) return null;
    
    const data = dreamDoc.data();
    return {
      id: dreamDoc.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      dreamDate: data.dreamDate.toDate(),
      createdAt: data.createdAt.toDate(),
      symbols: data.symbols || [],
      emotions: data.emotions || []
    };
  },

  getUserDreams: async (userId) => {
    // Simple mock - in real test would query Firestore
    return [];
  }
};

// Create InterpretationsService class with test config
class FirebaseInterpretationsService {
  constructor() {
    this.collectionName = 'interpretations';
    this.interpretationEngine = mockInterpretationEngine;
    this.dreamsService = mockDreamsService;
  }

  async createInterpretation(dreamId, data) {
    try {
      const dream = await this.dreamsService.getDreamById(dreamId);
      if (!dream) {
        throw new Error('Dream not found');
      }

      const generated = await this.interpretationEngine.generateInterpretation(
        dream.userId,
        dream,
        true
      );

      const interpretationData = {
        dreamId,
        overallTheme: generated.overallTheme,
        primaryMessage: generated.primaryMessage,
        symbolInterpretations: generated.symbolInterpretations,
        emotionalInsights: generated.emotionalInsights,
        exploratoryQuestions: generated.exploratoryQuestions,
        shadowWork: generated.shadowWork,
        integrationSuggestion: generated.integrationSuggestion,
        integrationSuggestions: [generated.integrationSuggestion],
        personalReflections: data.personalReflections || '',
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, this.collectionName, dreamId), interpretationData);

      return this.mapFirebaseInterpretationToInterpretation({
        id: dreamId,
        ...interpretationData
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to create interpretation');
    }
  }

  async getInterpretationByDreamId(dreamId) {
    try {
      const interpretationDoc = await getDoc(doc(db, this.collectionName, dreamId));
      
      if (!interpretationDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseInterpretationToInterpretation({
        id: interpretationDoc.id,
        ...interpretationDoc.data()
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to get interpretation');
    }
  }

  async updateInterpretation(dreamId, updates) {
    try {
      const updateData = {
        updatedAt: Timestamp.now()
      };
      
      if (updates.overallTheme) updateData.overallTheme = updates.overallTheme;
      if (updates.primaryMessage) updateData.primaryMessage = updates.primaryMessage;
      if (updates.integrationSuggestion) updateData.integrationSuggestion = updates.integrationSuggestion;
      if (updates.userReflections !== undefined) updateData.userReflections = updates.userReflections;
      
      await updateDoc(doc(db, this.collectionName, dreamId), updateData);
      
      const updatedInterpretation = await this.getInterpretationByDreamId(dreamId);
      if (!updatedInterpretation) {
        throw new Error('Interpretation not found after update');
      }
      
      return updatedInterpretation;
    } catch (error) {
      throw new Error(error.message || 'Failed to update interpretation');
    }
  }

  async deleteInterpretation(dreamId) {
    try {
      await deleteDoc(doc(db, this.collectionName, dreamId));
    } catch (error) {
      throw new Error(error.message || 'Failed to delete interpretation');
    }
  }

  async updateUserReflections(dreamId, reflections) {
    return this.updateInterpretation(dreamId, { userReflections: reflections });
  }

  async getUserInterpretations(userId) {
    try {
      const dreams = await this.dreamsService.getUserDreams(userId);
      const dreamIds = dreams.map(d => d.id);

      if (dreamIds.length === 0) return [];

      const interpretations = [];

      for (const dreamId of dreamIds) {
        const interpretation = await this.getInterpretationByDreamId(dreamId);
        if (interpretation) {
          interpretations.push(interpretation);
        }
      }

      return interpretations;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user interpretations');
    }
  }

  mapFirebaseInterpretationToInterpretation(firebaseInterpretation) {
    return {
      id: firebaseInterpretation.id,
      dreamId: firebaseInterpretation.dreamId,
      overallTheme: firebaseInterpretation.overallTheme,
      primaryMessage: firebaseInterpretation.primaryMessage,
      symbolInterpretations: firebaseInterpretation.symbolInterpretations || [],
      emotionalInsights: firebaseInterpretation.emotionalInsights || [],
      exploratoryQuestions: firebaseInterpretation.exploratoryQuestions || [],
      shadowWork: firebaseInterpretation.shadowWork || null,
      integrationSuggestion: firebaseInterpretation.integrationSuggestion,
      integrationSuggestions: firebaseInterpretation.integrationSuggestions || [],
      userReflections: firebaseInterpretation.userReflections,
      personalReflections: firebaseInterpretation.personalReflections,
      createdAt: firebaseInterpretation.createdAt.toDate(),
      updatedAt: firebaseInterpretation.updatedAt?.toDate()
    };
  }
}

const interpretationsService = new FirebaseInterpretationsService();

describe('Firebase Interpretations Service', () => {
  let testUser;
  let userId;
  let testDream;

  beforeEach(async () => {
    await signOutTestUser();
    testUser = await createTestUser('interpretationtest@example.com', 'testpass123');
    userId = testUser.uid;

    // Create a test dream
    const dreamData = {
      userId,
      title: 'Test Dream for Interpretation',
      description: 'Flying over mountains with a sense of freedom',
      dreamDate: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.now(),
      symbols: ['flying', 'mountains'],
      emotions: ['joy', 'freedom']
    };

    const dreamRef = doc(db, 'dreams', `test-dream-${userId}`);
    await setDoc(dreamRef, dreamData);
    testDream = {
      id: `test-dream-${userId}`,
      ...dreamData
    };

    await sleep(100);
  });

  afterEach(async () => {
    try {
      if (userId) {
        await cleanupUserData(userId);
        
        // Clean up test dream
        if (testDream) {
          await deleteDoc(doc(db, 'dreams', testDream.id));
        }
        
        // Clean up interpretation
        await deleteDoc(doc(db, 'interpretations', testDream?.id));
      }
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
    } catch (error) {
      console.log('Cleanup error (expected):', error.message);
    }
    await sleep(100);
  });

  describe('Create Interpretation', () => {
    it('should successfully create interpretation for a dream', async () => {
      const interpretationData = {
        personalReflections: 'This dream felt very liberating and meaningful to me'
      };

      const interpretation = await interpretationsService.createInterpretation(
        testDream.id, 
        interpretationData
      );

      expect(interpretation).toBeDefined();
      expect(interpretation.id).toBe(testDream.id); // Uses dreamId as ID
      expect(interpretation.dreamId).toBe(testDream.id);
      expect(interpretation.overallTheme).toBe('Test Overall Theme');
      expect(interpretation.primaryMessage).toBe('Test Primary Message');
      expect(interpretation.personalReflections).toBe(interpretationData.personalReflections);
      expect(interpretation.symbolInterpretations).toHaveLength(1);
      expect(interpretation.emotionalInsights).toHaveLength(1);
      expect(interpretation.exploratoryQuestions).toHaveLength(2);
      expect(interpretation.shadowWork).toBeDefined();
      expect(interpretation.createdAt).toBeInstanceOf(Date);
    });

    it('should fail to create interpretation for non-existent dream', async () => {
      await expect(interpretationsService.createInterpretation('non-existent-dream', {}))
        .rejects.toThrow('Dream not found');
    });
  });

  describe('Get Interpretation by Dream ID', () => {
    it('should retrieve existing interpretation', async () => {
      // First create an interpretation
      await interpretationsService.createInterpretation(testDream.id, {
        personalReflections: 'Test reflections'
      });

      const interpretation = await interpretationsService.getInterpretationByDreamId(testDream.id);

      expect(interpretation).toBeDefined();
      expect(interpretation.dreamId).toBe(testDream.id);
      expect(interpretation.personalReflections).toBe('Test reflections');
    });

    it('should return null for non-existent interpretation', async () => {
      const interpretation = await interpretationsService.getInterpretationByDreamId('non-existent');
      expect(interpretation).toBeNull();
    });
  });

  describe('Update Interpretation', () => {
    it('should successfully update interpretation fields', async () => {
      // Create interpretation first
      await interpretationsService.createInterpretation(testDream.id, {});

      const updates = {
        overallTheme: 'Updated Theme',
        primaryMessage: 'Updated Message',
        userReflections: 'My personal thoughts about this dream'
      };

      const updatedInterpretation = await interpretationsService.updateInterpretation(
        testDream.id,
        updates
      );

      expect(updatedInterpretation.overallTheme).toBe(updates.overallTheme);
      expect(updatedInterpretation.primaryMessage).toBe(updates.primaryMessage);
      expect(updatedInterpretation.userReflections).toBe(updates.userReflections);
      expect(updatedInterpretation.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail to update non-existent interpretation', async () => {
      await expect(interpretationsService.updateInterpretation('non-existent', {
        overallTheme: 'New Theme'
      })).rejects.toThrow();
    });
  });

  describe('Delete Interpretation', () => {
    it('should successfully delete interpretation', async () => {
      // Create interpretation first
      await interpretationsService.createInterpretation(testDream.id, {});

      await interpretationsService.deleteInterpretation(testDream.id);

      const deletedInterpretation = await interpretationsService.getInterpretationByDreamId(testDream.id);
      expect(deletedInterpretation).toBeNull();
    });
  });

  describe('Update User Reflections', () => {
    it('should update only user reflections', async () => {
      // Create interpretation first
      const originalInterpretation = await interpretationsService.createInterpretation(testDream.id, {
        personalReflections: 'Original personal reflections'
      });

      const newReflections = 'Updated user reflections after more thought';
      const updatedInterpretation = await interpretationsService.updateUserReflections(
        testDream.id,
        newReflections
      );

      expect(updatedInterpretation.userReflections).toBe(newReflections);
      expect(updatedInterpretation.personalReflections).toBe('Original personal reflections');
      expect(updatedInterpretation.overallTheme).toBe(originalInterpretation.overallTheme);
    });
  });

  describe('Get User Interpretations', () => {
    it('should retrieve all interpretations for user dreams', async () => {
      // For this test, mock the dreams service to return our test dream
      interpretationsService.dreamsService.getUserDreams = async (userId) => {
        if (userId === testUser.uid) {
          return [{
            id: testDream.id,
            userId: testDream.userId,
            title: testDream.title,
            description: testDream.description,
            dreamDate: testDream.dreamDate.toDate(),
            createdAt: testDream.createdAt.toDate(),
            symbols: testDream.symbols,
            emotions: testDream.emotions
          }];
        }
        return [];
      };

      // Create interpretation
      await interpretationsService.createInterpretation(testDream.id, {});

      const interpretations = await interpretationsService.getUserInterpretations(userId);

      expect(interpretations).toHaveLength(1);
      expect(interpretations[0].dreamId).toBe(testDream.id);
    });

    it('should return empty array for user with no dreams', async () => {
      const interpretations = await interpretationsService.getUserInterpretations('user-with-no-dreams');
      expect(interpretations).toEqual([]);
    });
  });

  describe('Data Mapping', () => {
    it('should correctly map Firebase interpretation data', async () => {
      const firebaseData = {
        id: 'test-id',
        dreamId: 'test-dream-id',
        overallTheme: 'Test Theme',
        primaryMessage: 'Test Message',
        symbolInterpretations: [{ symbol: 'test', meaning: 'test meaning' }],
        emotionalInsights: [{ emotion: 'joy', insight: 'test insight' }],
        exploratoryQuestions: ['Test question?'],
        shadowWork: { challenge: 'test' },
        integrationSuggestion: 'Test suggestion',
        integrationSuggestions: ['Suggestion 1', 'Suggestion 2'],
        userReflections: 'User thoughts',
        personalReflections: 'Personal thoughts',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const mapped = interpretationsService.mapFirebaseInterpretationToInterpretation(firebaseData);

      expect(mapped.id).toBe(firebaseData.id);
      expect(mapped.dreamId).toBe(firebaseData.dreamId);
      expect(mapped.overallTheme).toBe(firebaseData.overallTheme);
      expect(mapped.symbolInterpretations).toEqual(firebaseData.symbolInterpretations);
      expect(mapped.createdAt).toBeInstanceOf(Date);
      expect(mapped.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle missing optional fields', async () => {
      const firebaseData = {
        id: 'test-id',
        dreamId: 'test-dream-id',
        overallTheme: 'Test Theme',
        primaryMessage: 'Test Message',
        integrationSuggestion: 'Test suggestion',
        createdAt: Timestamp.now()
      };

      const mapped = interpretationsService.mapFirebaseInterpretationToInterpretation(firebaseData);

      expect(mapped.symbolInterpretations).toEqual([]);
      expect(mapped.emotionalInsights).toEqual([]);
      expect(mapped.exploratoryQuestions).toEqual([]);
      expect(mapped.shadowWork).toBeNull();
      expect(mapped.updatedAt).toBeUndefined();
    });
  });
});