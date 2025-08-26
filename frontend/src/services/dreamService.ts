import { api } from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';
import type {
  Dream,
  CreateDreamRequest,
  DreamSummary,
  PaginatedResponse,
  Symbol,
  Emotion
} from '../types';

export const dreamService = {
  async getDreams(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<DreamSummary>> {
    const response = await api.get<PaginatedResponse<DreamSummary>>(
      `${API_ENDPOINTS.DREAMS.BASE}?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  async getDreamById(id: number): Promise<Dream> {
    const response = await api.get<Dream>(API_ENDPOINTS.DREAMS.BY_ID(id));
    return response.data;
  },

  async createDream(dreamData: CreateDreamRequest): Promise<Dream> {
    const response = await api.post<Dream>(API_ENDPOINTS.DREAMS.BASE, dreamData);
    return response.data;
  },

  async updateDream(id: number, dreamData: Partial<CreateDreamRequest>): Promise<Dream> {
    const response = await api.put<Dream>(API_ENDPOINTS.DREAMS.BY_ID(id), dreamData);
    return response.data;
  },

  async deleteDream(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.DREAMS.BY_ID(id));
  },

  async searchDreams(query: string): Promise<DreamSummary[]> {
    const response = await api.get<DreamSummary[]>(
      `${API_ENDPOINTS.DREAMS.SEARCH}?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  async getSymbols(): Promise<Symbol[]> {
    const response = await api.get<Symbol[]>(API_ENDPOINTS.SYMBOLS);
    return response.data;
  },

  async getEmotions(): Promise<Emotion[]> {
    const response = await api.get<Emotion[]>(API_ENDPOINTS.EMOTIONS);
    return response.data;
  },
};
