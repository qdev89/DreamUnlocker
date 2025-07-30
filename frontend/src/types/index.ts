// Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Dream Types
export interface Dream {
  id: number;
  title: string;
  description: string;
  dreamDate: string;
  createdAt: string;
  updatedAt?: string;
  emotions: Emotion[];
  symbols: Symbol[];
  interpretation?: DreamInterpretation;
}

export interface CreateDreamRequest {
  title: string;
  description: string;
  dreamDate: string;
  emotionIds: number[];
  symbolNames: string[];
}

export interface DreamSummary {
  id: number;
  title: string;
  dreamDate: string;
  createdAt: string;
  emotionCount: number;
  symbolCount: number;
  hasInterpretation: boolean;
}

// Symbol and Emotion Types
export interface Symbol {
  id: number;
  name: string;
  archetypalMeaning: string;
  positiveAspect: string;
  negativeAspect: string;
  category: string;
  userContext?: string;
}

export interface Emotion {
  id: number;
  name: string;
  description: string;
  category: string;
  intensity: number;
}

// Interpretation Types
export interface DreamInterpretation {
  dreamId: number;
  overallTheme: string;
  primaryMessage: string;
  symbolInterpretations: SymbolInterpretation[];
  emotionalInsights: EmotionalInsight[];
  exploratoryQuestions: string[];
  shadowWork: ShadowWork;
  integrationSuggestion: string;
  createdAt: string;
}

export interface SymbolInterpretation {
  symbolId: number;
  symbolName: string;
  archetypalMeaning: string;
  personalizedInterpretation: string;
  lightAspect: string;
  shadowAspect: string;
  category: string;
  userFrequency: number;
  relatedSymbols: string[];
}

export interface EmotionalInsight {
  emotionName: string;
  intensity: number;
  insight: string;
  jungianPerspective: string;
  category: string;
}

export interface ShadowWork {
  shadowElements: string[];
  shadowInterpretation: string;
  integrationQuestions: string[];
  guidanceMessage: string;
}

export interface CreateInterpretationRequest {
  dreamId: number;
  includeShadowWork?: boolean;
  includePersonalHistory?: boolean;
  focusArea?: string;
}

export interface InterpretationTheme {
  themeName: string;
  description: string;
  commonSymbols: string[];
  keyQuestions: string[];
  jungianContext: string;
}

export interface PersonalSymbolPattern {
  symbolName: string;
  totalOccurrences: number;
  firstOccurrence: string;
  lastOccurrence: string;
  evolutionNotes: string[];
  personalMeaning: string;
  coOccurringSymbols: string[];
}

// Analytics Types
export interface DashboardStats {
  totalDreams: number;
  totalSymbols: number;
  totalEmotions: number;
  averageSymbolsPerDream: number;
  averageEmotionsPerDream: number;
  mostFrequentSymbol: string;
  mostFrequentEmotion: string;
  dreamingStreak: number;
  lastDreamDate?: string;
}

export interface SymbolFrequency {
  symbolName: string;
  frequency: number;
  category: string;
}

export interface EmotionFrequency {
  emotionName: string;
  frequency: number;
  averageIntensity: number;
  category: string;
}

export interface SymbolCorrelation {
  symbol1: string;
  symbol2: string;
  correlationStrength: number;
  coOccurrences: number;
}

export interface EmotionPattern {
  emotionName: string;
  averageIntensity: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  category: string;
}

export interface ActivityData {
  date: string;
  dreamCount: number;
  symbolCount: number;
  emotionCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
}
