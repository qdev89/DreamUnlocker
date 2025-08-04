// Firebase Services
export { firebaseAuthService } from './authService';
export { firebaseDreamsService } from './dreamsService';
export { firebaseSymbolsService } from './symbolsService';
export { firebaseInterpretationsService } from './interpretationsService';
export { firebaseAnalyticsService } from './analyticsService';

// Types
export type { User, AuthUser, RegisterData, LoginData } from './authService';
export type { Dream } from './dreamsService';
export type { Symbol } from './symbolsService';
export type { DreamInterpretation } from './interpretationsService';
export type { UserSymbolFrequency } from './analyticsService';
export type { DreamInterpretationCreateData, DreamCreateData } from '../../types/firebase';
