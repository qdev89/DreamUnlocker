import { api } from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';
import type {
  DashboardStats,
  SymbolFrequency,
  EmotionFrequency,
  SymbolCorrelation,
  EmotionPattern,
  ActivityData
} from '../types';

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    return response.data;
  },

  async getTopSymbols(limit: number = 10): Promise<SymbolFrequency[]> {
    const response = await api.get<SymbolFrequency[]>(
      `${API_ENDPOINTS.ANALYTICS.TOP_SYMBOLS}?limit=${limit}`
    );
    return response.data;
  },

  async getTopEmotions(limit: number = 10): Promise<EmotionFrequency[]> {
    const response = await api.get<EmotionFrequency[]>(
      `${API_ENDPOINTS.ANALYTICS.TOP_EMOTIONS}?limit=${limit}`
    );
    return response.data;
  },

  async getSymbolCorrelations(): Promise<SymbolCorrelation[]> {
    const response = await api.get<SymbolCorrelation[]>(
      `${API_ENDPOINTS.ANALYTICS.PATTERNS}/symbol-correlations`
    );
    return response.data;
  },

  async getEmotionPatterns(): Promise<EmotionPattern[]> {
    const response = await api.get<EmotionPattern[]>(
      `${API_ENDPOINTS.ANALYTICS.PATTERNS}/emotion-patterns`
    );
    return response.data;
  },

  async getActivityData(days: number = 30): Promise<ActivityData[]> {
    const response = await api.get<ActivityData[]>(
      `${API_ENDPOINTS.ANALYTICS.ACTIVITY}?days=${days}`
    );
    return response.data;
  },
};
