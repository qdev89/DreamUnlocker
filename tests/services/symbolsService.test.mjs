import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase-test.mjs';
import { generateTestSymbol, sleep } from '../utils/test-helpers.mjs';

// Create SymbolsService class with test config
class FirebaseSymbolsService {
  constructor() {
    this.collectionName = 'symbols';
  }

  async getAllSymbols() {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseSymbolToSymbol({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to get symbols');
    }
  }

  async getSymbolById(symbolId) {
    try {
      const symbolDoc = await getDoc(doc(db, this.collectionName, symbolId));
      
      if (!symbolDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseSymbolToSymbol({
        id: symbolDoc.id,
        ...symbolDoc.data()
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to get symbol');
    }
  }

  async searchSymbols(searchTerm) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('name', '>=', searchTerm.toLowerCase()),
        where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        orderBy('name', 'asc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseSymbolToSymbol({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to search symbols');
    }
  }

  async getSymbolsByCategory(category) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseSymbolToSymbol({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to get symbols by category');
    }
  }

  async getMostFrequentSymbols(limitCount = 10) {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('frequency', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseSymbolToSymbol({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to get frequent symbols');
    }
  }

  async getSymbolsByIds(symbolIds) {
    try {
      if (symbolIds.length === 0) return [];
      
      const chunks = this.chunkArray(symbolIds, 10);
      const allSymbols = [];
      
      for (const chunk of chunks) {
        const q = query(
          collection(db, this.collectionName),
          where('__name__', 'in', chunk)
        );
        
        const querySnapshot = await getDocs(q);
        const symbols = querySnapshot.docs.map(doc => 
          this.mapFirebaseSymbolToSymbol({
            id: doc.id,
            ...doc.data()
          })
        );
        
        allSymbols.push(...symbols);
      }
      
      return allSymbols;
    } catch (error) {
      throw new Error(error.message || 'Failed to get symbols by IDs');
    }
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  mapFirebaseSymbolToSymbol(firebaseSymbol) {
    return {
      id: firebaseSymbol.id,
      name: firebaseSymbol.name,
      archetypalMeaning: firebaseSymbol.archetypalMeaning,
      positiveAspect: firebaseSymbol.positiveAspect,
      negativeAspect: firebaseSymbol.negativeAspect,
      category: firebaseSymbol.category,
      frequency: firebaseSymbol.frequency
    };
  }
}

const symbolsService = new FirebaseSymbolsService();

describe('Firebase Symbols Service', () => {
  const testSymbolIds = [];

  beforeAll(async () => {
    // Skip symbol creation - Firebase security rules prevent writing symbols
    // Tests will use existing symbols from the database seeded via seedSymbols.mjs
    console.log('Using existing symbols from database (due to security rules)');
    await sleep(100);
  });

  afterAll(async () => {
    // No cleanup needed since we're using existing symbols
  });

  describe('Get All Symbols', () => {
    it('should retrieve all symbols ordered by name', async () => {
      const symbols = await symbolsService.getAllSymbols();
      
      expect(symbols.length).toBeGreaterThan(0);
      
      // Check if symbols are ordered by name
      for (let i = 1; i < symbols.length; i++) {
        expect(symbols[i].name >= symbols[i-1].name).toBe(true);
      }
      
      // Check structure of first symbol (any symbol will do)
      if (symbols.length > 0) {
        const symbol = symbols[0];
        expect(symbol.name).toBeDefined();
        expect(symbol.archetypalMeaning).toBeDefined();
        expect(symbol.positiveAspect).toBeDefined();
        expect(symbol.negativeAspect).toBeDefined();
        expect(symbol.category).toBeDefined();
        expect(typeof symbol.frequency).toBe('number');
      }
    });
  });

  describe('Get Symbol by ID', () => {
    it('should retrieve symbol by valid ID', async () => {
      const symbol = await symbolsService.getSymbolById('test-mountain');
      
      expect(symbol).toBeDefined();
      expect(symbol.name).toBe('mountain');
      expect(symbol.category).toBe('Nature');
      expect(symbol.frequency).toBe(15);
    });

    it('should return null for non-existent symbol ID', async () => {
      const symbol = await symbolsService.getSymbolById('non-existent-symbol');
      expect(symbol).toBeNull();
    });
  });

  describe('Search Symbols', () => {
    it('should find symbols by name prefix', async () => {
      const results = await symbolsService.searchSymbols('moun');
      
      expect(results.length).toBeGreaterThan(0);
      const mountain = results.find(s => s.name === 'mountain');
      expect(mountain).toBeDefined();
    });

    it('should return empty array for non-matching search', async () => {
      const results = await symbolsService.searchSymbols('xyz-nonexistent');
      expect(results).toEqual([]);
    });

    it('should limit results to 20 items', async () => {
      // Create many symbols with similar names if needed
      const results = await symbolsService.searchSymbols('');
      expect(results.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Get Symbols by Category', () => {
    it('should retrieve symbols in Nature category', async () => {
      const natureSymbols = await symbolsService.getSymbolsByCategory('Nature');
      
      expect(natureSymbols.length).toBeGreaterThanOrEqual(2);
      natureSymbols.forEach(symbol => {
        expect(symbol.category).toBe('Nature');
      });
      
      // Check if they're ordered by name
      for (let i = 1; i < natureSymbols.length; i++) {
        expect(natureSymbols[i].name >= natureSymbols[i-1].name).toBe(true);
      }
    });

    it('should return empty array for non-existent category', async () => {
      const symbols = await symbolsService.getSymbolsByCategory('NonExistentCategory');
      expect(symbols).toEqual([]);
    });
  });

  describe('Get Most Frequent Symbols', () => {
    it('should retrieve symbols ordered by frequency descending', async () => {
      const frequentSymbols = await symbolsService.getMostFrequentSymbols(5);
      
      expect(frequentSymbols.length).toBeGreaterThan(0);
      expect(frequentSymbols.length).toBeLessThanOrEqual(5);
      
      // Check if ordered by frequency descending
      for (let i = 1; i < frequentSymbols.length; i++) {
        expect(frequentSymbols[i].frequency <= frequentSymbols[i-1].frequency).toBe(true);
      }
      
      // The 'house' symbol should be first (frequency: 30)
      expect(frequentSymbols[0].name).toBe('house');
    });

    it('should respect default limit of 10', async () => {
      const symbols = await symbolsService.getMostFrequentSymbols();
      expect(symbols.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Get Symbols by IDs', () => {
    it('should retrieve multiple symbols by their IDs', async () => {
      const symbolIds = ['test-mountain', 'test-ocean', 'test-flying'];
      const symbols = await symbolsService.getSymbolsByIds(symbolIds);
      
      expect(symbols).toHaveLength(3);
      
      const names = symbols.map(s => s.name).sort();
      expect(names).toEqual(['flying', 'mountain', 'ocean']);
    });

    it('should handle empty ID array', async () => {
      const symbols = await symbolsService.getSymbolsByIds([]);
      expect(symbols).toEqual([]);
    });

    it('should handle IDs with some non-existent symbols', async () => {
      const symbolIds = ['test-mountain', 'non-existent', 'test-ocean'];
      const symbols = await symbolsService.getSymbolsByIds(symbolIds);
      
      expect(symbols).toHaveLength(2);
      const names = symbols.map(s => s.name).sort();
      expect(names).toEqual(['mountain', 'ocean']);
    });

    it('should handle more than 10 IDs (chunking test)', async () => {
      // Create more test symbols for this test
      const manyIds = [];
      const batch = writeBatch(db);
      
      for (let i = 0; i < 15; i++) {
        const id = `test-chunk-${i}`;
        manyIds.push(id);
        batch.set(doc(db, 'symbols', id), {
          id,
          name: `chunk-symbol-${i}`,
          archetypalMeaning: `Test meaning ${i}`,
          positiveAspect: `Positive ${i}`,
          negativeAspect: `Negative ${i}`,
          category: 'Test',
          frequency: i
        });
      }
      
      await batch.commit();
      await sleep(100);
      
      const symbols = await symbolsService.getSymbolsByIds(manyIds);
      expect(symbols).toHaveLength(15);
      
      // Clean up
      const cleanupBatch = writeBatch(db);
      for (const id of manyIds) {
        cleanupBatch.delete(doc(db, 'symbols', id));
      }
      await cleanupBatch.commit();
    });
  });

  describe('Chunk Array Helper', () => {
    it('should correctly chunk an array', async () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const chunks = symbolsService.chunkArray(array, 3);
      
      expect(chunks).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11]
      ]);
    });

    it('should handle empty array', async () => {
      const chunks = symbolsService.chunkArray([], 5);
      expect(chunks).toEqual([]);
    });
  });
});