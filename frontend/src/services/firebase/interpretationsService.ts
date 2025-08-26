import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { FirebaseDreamInterpretation, DreamInterpretationCreateData } from '../../types/firebase';
import { interpretationEngine } from './interpretationEngine';
import { firebaseDreamsService } from './dreamsService';

export interface DreamInterpretation {
  id: string;
  dreamId: string;
  overallTheme: string;
  primaryMessage: string;
  symbolInterpretations: any[];
  emotionalInsights: any[];
  exploratoryQuestions: string[];
  shadowWork: any | null;
  integrationSuggestion: string;
  integrationSuggestions: string[];
  userReflections?: string;
  personalReflections?: string;
  createdAt: Date;
  updatedAt?: Date;
}

class FirebaseInterpretationsService {
  private collectionName = 'interpretations';
  
  // Create interpretation (uses dreamId as document ID)
  async createInterpretation(dreamId: string, data: DreamInterpretationCreateData): Promise<DreamInterpretation> {
    try {
      // Get the dream to generate interpretation
      const dream = await firebaseDreamsService.getDreamById(dreamId);
      if (!dream) {
        throw new Error('Dream not found');
      }

      // Generate interpretation using the interpretation engine
      const generated = await interpretationEngine.generateInterpretation(
        dream.userId,
        dream,
        true // include shadow work
      );

      const interpretationData: Omit<FirebaseDreamInterpretation, 'id'> = {
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

      // Use dreamId as document ID for easy lookup
      await setDoc(doc(db, this.collectionName, dreamId), interpretationData);

      return this.mapFirebaseInterpretationToInterpretation({
        id: dreamId,
        ...interpretationData
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create interpretation');
    }
  }
  
  // Get interpretation by dream ID
  async getInterpretationByDreamId(dreamId: string): Promise<DreamInterpretation | null> {
    try {
      const interpretationDoc = await getDoc(doc(db, this.collectionName, dreamId));
      
      if (!interpretationDoc.exists()) {
        return null;
      }
      
      return this.mapFirebaseInterpretationToInterpretation({
        id: interpretationDoc.id,
        ...interpretationDoc.data()
      } as FirebaseDreamInterpretation);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get interpretation');
    }
  }
  
  // Update interpretation
  async updateInterpretation(
    dreamId: string, 
    updates: Partial<Omit<DreamInterpretationCreateData, 'dreamId'>>
  ): Promise<DreamInterpretation> {
    try {
      const updateData: any = {
        updatedAt: Timestamp.now()
      };
      
      if (updates.overallTheme) updateData.overallTheme = updates.overallTheme;
      if (updates.primaryMessage) updateData.primaryMessage = updates.primaryMessage;
      if (updates.integrationSuggestion) updateData.integrationSuggestion = updates.integrationSuggestion;
      if (updates.userReflections !== undefined) updateData.userReflections = updates.userReflections;
      
      await updateDoc(doc(db, this.collectionName, dreamId), updateData);
      
      // Get updated interpretation
      const updatedInterpretation = await this.getInterpretationByDreamId(dreamId);
      if (!updatedInterpretation) {
        throw new Error('Interpretation not found after update');
      }
      
      return updatedInterpretation;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update interpretation');
    }
  }
  
  // Delete interpretation
  async deleteInterpretation(dreamId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, dreamId));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete interpretation');
    }
  }
  
  // Update user reflections only
  async updateUserReflections(dreamId: string, reflections: string): Promise<DreamInterpretation> {
    return this.updateInterpretation(dreamId, { userReflections: reflections });
  }
  
  // Get user interpretations
  async getUserInterpretations(userId: string): Promise<DreamInterpretation[]> {
    try {
      // Get user's dreams first
      const dreams = await firebaseDreamsService.getUserDreams(userId);
      const dreamIds = dreams.map(d => d.id);

      if (dreamIds.length === 0) return [];

      // Get interpretations for user's dreams
      const interpretations: DreamInterpretation[] = [];

      for (const dreamId of dreamIds) {
        const interpretation = await this.getInterpretationByDreamId(dreamId);
        if (interpretation) {
          interpretations.push(interpretation);
        }
      }

      return interpretations;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user interpretations');
    }
  }

  // Helper method to map Firebase interpretation to DreamInterpretation
  private mapFirebaseInterpretationToInterpretation(
    firebaseInterpretation: FirebaseDreamInterpretation
  ): DreamInterpretation {
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

export const firebaseInterpretationsService = new FirebaseInterpretationsService();
