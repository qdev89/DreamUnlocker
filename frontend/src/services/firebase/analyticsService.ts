import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { FirebaseUserSymbolFrequency } from '../../types/firebase';
import { logger } from '../../lib/logger';

export interface UserSymbolFrequency {
  id: string;
  userId: string;
  symbolId: string;
  symbolName: string;
  frequency: number;
  lastOccurrence: Date;
  createdAt: Date;
}

class FirebaseAnalyticsService {
  private userFrequenciesCollection = 'userSymbolFrequencies';
  private symbolsCollection = 'symbols';
  
  // Update user symbol frequency when a dream is created with symbols
  async updateUserSymbolFrequency(userId: string, symbolId: string, symbolName: string): Promise<void> {
    try {
      const frequencyDocId = `${userId}_${symbolId}`;
      const frequencyDocRef = doc(db, this.userFrequenciesCollection, frequencyDocId);
      
      const existingDoc = await getDoc(frequencyDocRef);
      
      if (existingDoc.exists()) {
        // Update existing frequency
        await updateDoc(frequencyDocRef, {
          frequency: increment(1),
          lastOccurrence: Timestamp.now()
        });
      } else {
        // Create new frequency record
        await setDoc(frequencyDocRef, {
          userId,
          symbolId,
          symbolName,
          frequency: 1,
          lastOccurrence: Timestamp.now(),
          createdAt: Timestamp.now()
        });
      }
      
      // Also update the global symbol frequency
      await this.updateGlobalSymbolFrequency(symbolId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update symbol frequency');
    }
  }
  
  // Update global symbol frequency in the symbols collection
  private async updateGlobalSymbolFrequency(symbolId: string): Promise<void> {
    try {
      const symbolDocRef = doc(db, this.symbolsCollection, symbolId);
      await updateDoc(symbolDocRef, {
        frequency: increment(1)
      });
    } catch (error: any) {
      // If symbol doesn't exist, we'll skip updating global frequency
      logger.warn(`Could not update global frequency for symbol ${symbolId}:`, error.message);
    }
  }
  
  // Get user's most frequent symbols
  async getUserMostFrequentSymbols(userId: string, limitCount: number = 10): Promise<UserSymbolFrequency[]> {
    try {
      const q = query(
        collection(db, this.userFrequenciesCollection),
        where('userId', '==', userId),
        orderBy('frequency', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseFrequencyToFrequency({
          id: doc.id,
          ...doc.data()
        } as FirebaseUserSymbolFrequency)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user frequent symbols');
    }
  }
  
  // Get user's recent symbols
  async getUserRecentSymbols(userId: string, limitCount: number = 10): Promise<UserSymbolFrequency[]> {
    try {
      const q = query(
        collection(db, this.userFrequenciesCollection),
        where('userId', '==', userId),
        orderBy('lastOccurrence', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseFrequencyToFrequency({
          id: doc.id,
          ...doc.data()
        } as FirebaseUserSymbolFrequency)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user recent symbols');
    }
  }
  
  // Get all user symbol frequencies
  async getUserSymbolFrequencies(userId: string): Promise<UserSymbolFrequency[]> {
    try {
      const q = query(
        collection(db, this.userFrequenciesCollection),
        where('userId', '==', userId),
        orderBy('frequency', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirebaseFrequencyToFrequency({
          id: doc.id,
          ...doc.data()
        } as FirebaseUserSymbolFrequency)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user symbol frequencies');
    }
  }
  
  // Get user's symbol frequency for a specific symbol
  async getUserSymbolFrequency(userId: string, symbolId: string): Promise<UserSymbolFrequency | null> {
    try {
      const frequencyDocId = `${userId}_${symbolId}`;
      const frequencyDoc = await getDoc(doc(db, this.userFrequenciesCollection, frequencyDocId));
      
      if (!frequencyDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseFrequencyToFrequency({
        id: frequencyDoc.id,
        ...frequencyDoc.data()
      } as FirebaseUserSymbolFrequency);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user symbol frequency');
    }
  }
  
  // Batch update symbol frequencies for multiple symbols (used when creating dreams)
  async batchUpdateSymbolFrequencies(userId: string, symbols: Array<{id: string, name: string}>): Promise<void> {
    try {
      // Update frequencies for each symbol
      const updatePromises = symbols.map(symbol => 
        this.updateUserSymbolFrequency(userId, symbol.id, symbol.name)
      );
      
      await Promise.all(updatePromises);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to batch update symbol frequencies');
    }
  }
  
  // Get analytics summary for a user
  async getUserAnalyticsSummary(userId: string): Promise<{
    totalSymbols: number;
    mostFrequentSymbol: UserSymbolFrequency | null;
    recentSymbols: UserSymbolFrequency[];
    topCategories: Array<{category: string, count: number}>;
  }> {
    try {
      const frequencies = await this.getUserSymbolFrequencies(userId);
      
      const totalSymbols = frequencies.length;
      const mostFrequentSymbol = frequencies.length > 0 ? frequencies[0] : null;
      const recentSymbols = await this.getUserRecentSymbols(userId, 5);
      
      // Calculate top categories (this would require symbol data, simplified for now)
      const topCategories: Array<{category: string, count: number}> = [];
      
      return {
        totalSymbols,
        mostFrequentSymbol,
        recentSymbols,
        topCategories
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user analytics summary');
    }
  }
  
  // Helper method to map Firebase frequency to UserSymbolFrequency
  private mapFirebaseFrequencyToFrequency(firebaseFrequency: FirebaseUserSymbolFrequency): UserSymbolFrequency {
    return {
      id: firebaseFrequency.id,
      userId: firebaseFrequency.userId,
      symbolId: firebaseFrequency.symbolId,
      symbolName: firebaseFrequency.symbolName,
      frequency: firebaseFrequency.frequency,
      lastOccurrence: firebaseFrequency.lastOccurrence.toDate(),
      createdAt: firebaseFrequency.createdAt.toDate()
    };
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();
