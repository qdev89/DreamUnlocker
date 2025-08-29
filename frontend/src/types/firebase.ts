import { Timestamp } from 'firebase/firestore';

// Firebase User Document
export interface FirebaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

// Firebase Dream Document
export interface FirebaseDream {
  id: string;
  userId: string;
  title: string;
  description: string;
  dreamDate: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  symbols: string[]; // Array of symbol IDs
  emotions: string[]; // Array of emotion IDs
}

// Firebase Symbol Document
export interface FirebaseSymbol {
  id: string;
  name: string;
  archetypalMeaning: string;
  positiveAspect: string;
  negativeAspect: string;
  category: string;
  frequency: number;
}

// Firebase Emotion Document
export interface FirebaseEmotion {
  id: string;
  name: string;
  category: string;
}

// Symbol Interpretation Interface
export interface SymbolInterpretation {
  symbolId: string;
  symbolName: string;
  meaning: string;
  context: string;
  archetypalConnection: string;
}

// Emotional Insight Interface
export interface EmotionalInsight {
  emotion: string;
  intensity: number; // 1-5 scale
  context: string;
  psychologicalSignificance: string;
}

// Shadow Work Interface
export interface ShadowWork {
  shadowAspects: string[];
  integrationApproaches: string[];
  reflection: string;
}

// Firebase Dream Interpretation Document
export interface FirebaseDreamInterpretation {
  id: string; // Same as dreamId
  dreamId: string;
  overallTheme: string;
  primaryMessage: string;
  symbolInterpretations: SymbolInterpretation[];
  emotionalInsights: EmotionalInsight[];
  exploratoryQuestions: string[];
  shadowWork: ShadowWork | null;
  integrationSuggestion: string;
  integrationSuggestions: string[];
  userReflections?: string;
  personalReflections?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Firebase User Symbol Frequency Document
export interface FirebaseUserSymbolFrequency {
  id: string; // Format: userId_symbolId
  userId: string;
  symbolId: string;
  symbolName: string;
  frequency: number;
  lastOccurrence: Timestamp;
  createdAt: Timestamp;
}

// Conversion helpers for existing types
export interface DreamCreateData {
  title: string;
  description: string;
  dreamDate: Date;
  symbols?: string[];
  emotions?: string[];
}

export interface DreamInterpretationCreateData {
  overallTheme: string;
  primaryMessage: string;
  integrationSuggestion: string;
  userReflections?: string;
  personalReflections?: string;
}

// Error handling types
export interface FirebaseError {
  code: string;
  message: string;
}

export interface AuthError extends FirebaseError {
  email?: string;
}

export interface DatabaseError extends FirebaseError {
  operation?: string;
  documentId?: string;
}
