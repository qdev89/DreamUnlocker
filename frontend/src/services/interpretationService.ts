import { api } from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';
import type {
  DreamInterpretation,
  CreateInterpretationRequest,
  InterpretationTheme,
  PersonalSymbolPattern,
  ShadowWork
} from '../types';

export const interpretationService = {
  async createInterpretation(request: CreateInterpretationRequest): Promise<DreamInterpretation> {
    const response = await api.post<DreamInterpretation>(API_ENDPOINTS.INTERPRETATION.BASE, request);
    return response.data;
  },

  async getInterpretationByDream(dreamId: number): Promise<DreamInterpretation> {
    const response = await api.get<DreamInterpretation>(API_ENDPOINTS.INTERPRETATION.BY_DREAM(dreamId));
    return response.data;
  },

  async getInterpretationThemes(): Promise<InterpretationTheme[]> {
    const response = await api.get<InterpretationTheme[]>(API_ENDPOINTS.INTERPRETATION.THEMES);
    return response.data;
  },

  async getPersonalSymbolPatterns(): Promise<PersonalSymbolPattern[]> {
    const response = await api.get<PersonalSymbolPattern[]>(API_ENDPOINTS.INTERPRETATION.PATTERNS);
    return response.data;
  },

  async getExploratoryQuestions(dreamId: number): Promise<string[]> {
    const response = await api.get<string[]>(API_ENDPOINTS.INTERPRETATION.QUESTIONS(dreamId));
    return response.data;
  },

  async getShadowWork(dreamId: number): Promise<ShadowWork> {
    const response = await api.get<ShadowWork>(API_ENDPOINTS.INTERPRETATION.SHADOW(dreamId));
    return response.data;
  },
};
