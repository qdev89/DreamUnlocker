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
import { db } from '../../config/firebase';
import type { FirebaseDream, DreamCreateData } from '../../types/firebase';

export interface Dream {
  id: string;
  userId: string;
  title: string;
  description: string;
  dreamDate: Date;
  createdAt: Date;
  updatedAt?: Date;
  symbols: string[];
  emotions: string[];
}

class FirebaseDreamsService {
  private collectionName = 'dreams';
  
  // Create a new dream
  async createDream(userId: string, dreamData: DreamCreateData): Promise<Dream> {
    try {
      const firebaseDream: Omit<FirebaseDream, 'id'> = {
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
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create dream');
    }
  }
  
  // Get dream by ID
  async getDreamById(dreamId: string): Promise<Dream | null> {
    try {
      const dreamDoc = await getDoc(doc(db, this.collectionName, dreamId));
      
      if (!dreamDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseDreamToDream({
        id: dreamDoc.id,
        ...dreamDoc.data()
      } as FirebaseDream);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get dream');
    }
  }
  
  // Get all dreams for a user
  async getUserDreams(userId: string, limitCount?: number): Promise<Dream[]> {
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
        } as FirebaseDream)
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user dreams');
    }
  }
  
  // Update dream
  async updateDream(dreamId: string, updates: Partial<DreamCreateData>): Promise<Dream> {
    try {
      const updateData: any = {
        updatedAt: Timestamp.now()
      };
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.dreamDate) updateData.dreamDate = Timestamp.fromDate(updates.dreamDate);
      if (updates.symbols) updateData.symbols = updates.symbols;
      if (updates.emotions) updateData.emotions = updates.emotions;
      
      await updateDoc(doc(db, this.collectionName, dreamId), updateData);
      
      // Get updated dream
      const updatedDream = await this.getDreamById(dreamId);
      if (!updatedDream) {
        throw new Error('Dream not found after update');
      }
      
      return updatedDream;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update dream');
    }
  }
  
  // Delete dream
  async deleteDream(dreamId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, dreamId));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete dream');
    }
  }
  
  // Get recent dreams for dashboard
  async getRecentDreams(userId: string): Promise<Dream[]> {
    return this.getUserDreams(userId, 5);
  }

  // Search user dreams by title or description
  async searchUserDreams(userId: string, searchQuery: string): Promise<Dream[]> {
    try {
      const dreams = await this.getUserDreams(userId);
      const lowercaseQuery = searchQuery.toLowerCase();

      return dreams.filter(dream =>
        dream.title.toLowerCase().includes(lowercaseQuery) ||
        dream.description.toLowerCase().includes(lowercaseQuery) ||
        dream.symbols.some(symbol => symbol.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search dreams');
    }
  }
  
  // Helper method to map Firebase dream to Dream
  private mapFirebaseDreamToDream(firebaseDream: FirebaseDream): Dream {
    // Helper function to safely convert to Date
    const toDate = (value: any): Date => {
      if (!value) return new Date();
      if (value.toDate && typeof value.toDate === 'function') {
        return value.toDate();
      }
      if (value.seconds) {
        // Firestore Timestamp object
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

export const firebaseDreamsService = new FirebaseDreamsService();
