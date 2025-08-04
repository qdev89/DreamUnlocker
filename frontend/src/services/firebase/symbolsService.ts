import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { FirebaseSymbol } from '../../types/firebase';

export interface Symbol {
  id: string;
  name: string;
  archetypalMeaning: string;
  positiveAspect: string;
  negativeAspect: string;
  category: string;
  frequency: number;
}

class FirebaseSymbolsService {
  private collectionName = 'symbols';
  
  // Get all symbols
  async getAllSymbols(): Promise<Symbol[]> {
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
        } as FirebaseSymbol)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get symbols');
    }
  }
  
  // Get symbol by ID
  async getSymbolById(symbolId: string): Promise<Symbol | null> {
    try {
      const symbolDoc = await getDoc(doc(db, this.collectionName, symbolId));
      
      if (!symbolDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseSymbolToSymbol({
        id: symbolDoc.id,
        ...symbolDoc.data()
      } as FirebaseSymbol);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get symbol');
    }
  }
  
  // Search symbols by name
  async searchSymbols(searchTerm: string): Promise<Symbol[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple prefix search. For production, consider using Algolia or similar
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
        } as FirebaseSymbol)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search symbols');
    }
  }
  
  // Get symbols by category
  async getSymbolsByCategory(category: string): Promise<Symbol[]> {
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
        } as FirebaseSymbol)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get symbols by category');
    }
  }
  
  // Get most frequent symbols
  async getMostFrequentSymbols(limitCount: number = 10): Promise<Symbol[]> {
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
        } as FirebaseSymbol)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get frequent symbols');
    }
  }
  
  // Get symbols by IDs (for dream details)
  async getSymbolsByIds(symbolIds: string[]): Promise<Symbol[]> {
    try {
      if (symbolIds.length === 0) return [];
      
      // Firestore 'in' queries are limited to 10 items
      const chunks = this.chunkArray(symbolIds, 10);
      const allSymbols: Symbol[] = [];
      
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
          } as FirebaseSymbol)
        );
        
        allSymbols.push(...symbols);
      }
      
      return allSymbols;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get symbols by IDs');
    }
  }
  
  // Helper method to chunk array for Firestore 'in' query limitation
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  // Helper method to map Firebase symbol to Symbol
  private mapFirebaseSymbolToSymbol(firebaseSymbol: FirebaseSymbol): Symbol {
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

export const firebaseSymbolsService = new FirebaseSymbolsService();
