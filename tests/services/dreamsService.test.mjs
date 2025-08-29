import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase-test.mjs';
import { 
  createTestUser, 
  cleanupUserData,
  generateTestDream,
  signOutTestUser,
  sleep 
} from '../utils/test-helpers.mjs';

// Create DreamsService class with test config
class FirebaseDreamsService {
  constructor() {
    this.collectionName = 'dreams';
  }
  
  async createDream(userId, dreamData) {
    try {
      const firebaseDream = {
        userId,
        title: dreamData.title,
        description: dreamData.description,
        dreamDate: Timestamp.fromDate(dreamData.dreamDate),
        createdAt: Timestamp.now(),
        symbols: dreamData.symbols || [],
        emotions: dreamData.emotions || []
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), firebaseDream);
      
      return this.mapFirebaseDreamToDream({
        id: docRef.id,
        ...firebaseDream
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to create dream');
    }
  }
  
  async getDreamById(dreamId) {
    try {
      const dreamDoc = await getDoc(doc(db, this.collectionName, dreamId));
      
      if (!dreamDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseDreamToDream({
        id: dreamDoc.id,
        ...dreamDoc.data()
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to get dream');
    }
  }
  
  async getUserDreams(userId, limitCount) {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('dreamDate', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        this.mapFirebaseDreamToDream({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to get user dreams');
    }
  }
  
  async updateDream(dreamId, updates) {
    try {
      const updateData = {
        updatedAt: Timestamp.now()
      };
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.dreamDate) updateData.dreamDate = Timestamp.fromDate(updates.dreamDate);
      if (updates.symbols) updateData.symbols = updates.symbols;
      if (updates.emotions) updateData.emotions = updates.emotions;
      
      await updateDoc(doc(db, this.collectionName, dreamId), updateData);
      
      const updatedDream = await this.getDreamById(dreamId);
      if (!updatedDream) {
        throw new Error('Dream not found after update');
      }
      
      return updatedDream;
    } catch (error) {
      throw new Error(error.message || 'Failed to update dream');
    }
  }
  
  async deleteDream(dreamId) {
    try {
      await deleteDoc(doc(db, this.collectionName, dreamId));
    } catch (error) {
      throw new Error(error.message || 'Failed to delete dream');
    }
  }
  
  async getRecentDreams(userId) {
    return this.getUserDreams(userId, 5);
  }

  async searchUserDreams(userId, searchQuery) {
    try {
      const dreams = await this.getUserDreams(userId);
      const lowercaseQuery = searchQuery.toLowerCase();

      return dreams.filter(dream =>
        dream.title.toLowerCase().includes(lowercaseQuery) ||
        dream.description.toLowerCase().includes(lowercaseQuery) ||
        dream.symbols.some(symbol => symbol.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to search dreams');
    }
  }
  
  mapFirebaseDreamToDream(firebaseDream) {
    const toDate = (value) => {
      if (!value) return new Date();
      if (value.toDate && typeof value.toDate === 'function') {
        return value.toDate();
      }
      if (value.seconds) {
        return new Date(value.seconds * 1000);
      }
      return new Date(value);
    };

    return {
      id: firebaseDream.id,
      userId: firebaseDream.userId,
      title: firebaseDream.title,
      description: firebaseDream.description,
      dreamDate: toDate(firebaseDream.dreamDate),
      createdAt: toDate(firebaseDream.createdAt),
      updatedAt: firebaseDream.updatedAt ? toDate(firebaseDream.updatedAt) : undefined,
      symbols: firebaseDream.symbols || [],
      emotions: firebaseDream.emotions || []
    };
  }
}

const dreamsService = new FirebaseDreamsService();

describe('Firebase Dreams Service', () => {
  let testUser;
  let userId;

  beforeEach(async () => {
    await signOutTestUser();
    testUser = await createTestUser('dreamstest@example.com', 'testpass123');
    userId = testUser.uid;
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

  describe('Create Dream', () => {
    it('should successfully create a new dream', async () => {
      const dreamData = {
        title: 'Test Dream',
        description: 'A test dream about flying',
        dreamDate: new Date(),
        symbols: ['flying', 'sky'],
        emotions: ['joy', 'freedom']
      };

      const dream = await dreamsService.createDream(userId, dreamData);

      expect(dream).toBeDefined();
      expect(dream.id).toBeDefined();
      expect(dream.userId).toBe(userId);
      expect(dream.title).toBe(dreamData.title);
      expect(dream.description).toBe(dreamData.description);
      expect(dream.symbols).toEqual(dreamData.symbols);
      expect(dream.emotions).toEqual(dreamData.emotions);
      expect(dream.createdAt).toBeInstanceOf(Date);
    });

    it('should create dream with minimal data', async () => {
      const dreamData = {
        title: 'Simple Dream',
        description: 'A simple dream',
        dreamDate: new Date()
      };

      const dream = await dreamsService.createDream(userId, dreamData);

      expect(dream).toBeDefined();
      expect(dream.symbols).toEqual([]);
      expect(dream.emotions).toEqual([]);
    });
  });

  describe('Get Dream by ID', () => {
    it('should retrieve existing dream by ID', async () => {
      const dreamData = {
        title: 'Test Dream',
        description: 'Test description',
        dreamDate: new Date(),
        symbols: ['test'],
        emotions: ['curious']
      };

      const createdDream = await dreamsService.createDream(userId, dreamData);
      const retrievedDream = await dreamsService.getDreamById(createdDream.id);

      expect(retrievedDream).toBeDefined();
      expect(retrievedDream?.id).toBe(createdDream.id);
      expect(retrievedDream?.title).toBe(dreamData.title);
    });

    it('should return null for non-existent dream', async () => {
      const dream = await dreamsService.getDreamById('non-existent-id');
      expect(dream).toBeNull();
    });
  });

  describe('Get User Dreams', () => {
    it('should retrieve all dreams for a user', async () => {
      // Create multiple dreams
      const dreamData1 = {
        title: 'Dream 1',
        description: 'First dream',
        dreamDate: new Date(),
      };
      
      const dreamData2 = {
        title: 'Dream 2',
        description: 'Second dream',
        dreamDate: new Date(Date.now() - 86400000), // Yesterday
      };

      await dreamsService.createDream(userId, dreamData1);
      await dreamsService.createDream(userId, dreamData2);

      const dreams = await dreamsService.getUserDreams(userId);

      expect(dreams).toHaveLength(2);
      expect(dreams[0].title).toBe('Dream 1'); // More recent first
      expect(dreams[1].title).toBe('Dream 2');
    });

    it('should respect limit parameter', async () => {
      // Create 3 dreams
      for (let i = 1; i <= 3; i++) {
        await dreamsService.createDream(userId, {
          title: `Dream ${i}`,
          description: `Dream description ${i}`,
          dreamDate: new Date(Date.now() - i * 86400000),
        });
      }

      const dreams = await dreamsService.getUserDreams(userId, 2);

      expect(dreams).toHaveLength(2);
    });

    it('should return empty array for user with no dreams', async () => {
      const dreams = await dreamsService.getUserDreams(userId);
      expect(dreams).toEqual([]);
    });
  });

  describe('Update Dream', () => {
    it('should successfully update dream fields', async () => {
      const dreamData = {
        title: 'Original Title',
        description: 'Original description',
        dreamDate: new Date(),
        symbols: ['original'],
        emotions: ['neutral']
      };

      const dream = await dreamsService.createDream(userId, dreamData);

      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        symbols: ['updated', 'new'],
        emotions: ['happy']
      };

      const updatedDream = await dreamsService.updateDream(dream.id, updates);

      expect(updatedDream.title).toBe(updates.title);
      expect(updatedDream.description).toBe(updates.description);
      expect(updatedDream.symbols).toEqual(updates.symbols);
      expect(updatedDream.emotions).toEqual(updates.emotions);
      expect(updatedDream.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail to update non-existent dream', async () => {
      await expect(dreamsService.updateDream('non-existent', { title: 'New Title' }))
        .rejects.toThrow();
    });
  });

  describe('Delete Dream', () => {
    it('should successfully delete a dream', async () => {
      const dreamData = {
        title: 'Dream to Delete',
        description: 'This dream will be deleted',
        dreamDate: new Date(),
      };

      const dream = await dreamsService.createDream(userId, dreamData);

      await dreamsService.deleteDream(dream.id);

      const deletedDream = await dreamsService.getDreamById(dream.id);
      expect(deletedDream).toBeNull();
    });
  });

  describe('Get Recent Dreams', () => {
    it('should return maximum 5 recent dreams', async () => {
      // Create 7 dreams
      for (let i = 1; i <= 7; i++) {
        await dreamsService.createDream(userId, {
          title: `Dream ${i}`,
          description: `Dream description ${i}`,
          dreamDate: new Date(Date.now() - i * 86400000),
        });
      }

      const recentDreams = await dreamsService.getRecentDreams(userId);

      expect(recentDreams).toHaveLength(5);
    });
  });

  describe('Search Dreams', () => {
    beforeEach(async () => {
      // Create test dreams for searching
      const dreams = [
        {
          title: 'Flying Over Mountains',
          description: 'I was soaring through the sky above snow-capped peaks',
          dreamDate: new Date(),
          symbols: ['flying', 'mountains', 'sky'],
          emotions: ['freedom', 'joy']
        },
        {
          title: 'Ocean Adventure',
          description: 'Swimming with dolphins in crystal clear water',
          dreamDate: new Date(),
          symbols: ['ocean', 'dolphins', 'water'],
          emotions: ['peace', 'wonder']
        },
        {
          title: 'Forest Journey',
          description: 'Walking through a dense forest at sunset',
          dreamDate: new Date(),
          symbols: ['forest', 'trees', 'sunset'],
          emotions: ['calm', 'mystery']
        }
      ];

      for (const dreamData of dreams) {
        await dreamsService.createDream(userId, dreamData);
      }
    });

    it('should search dreams by title', async () => {
      const results = await dreamsService.searchUserDreams(userId, 'flying');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Flying Over Mountains');
    });

    it('should search dreams by description', async () => {
      const results = await dreamsService.searchUserDreams(userId, 'dolphins');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Ocean Adventure');
    });

    it('should search dreams by symbols', async () => {
      const results = await dreamsService.searchUserDreams(userId, 'forest');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Forest Journey');
    });

    it('should return empty array for no matches', async () => {
      const results = await dreamsService.searchUserDreams(userId, 'nonexistent');
      
      expect(results).toEqual([]);
    });

    it('should be case insensitive', async () => {
      const results = await dreamsService.searchUserDreams(userId, 'OCEAN');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Ocean Adventure');
    });
  });
});