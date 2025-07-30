export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5041/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Dreams
  DREAMS: {
    BASE: '/dreams',
    BY_ID: (id: number) => `/dreams/${id}`,
    SEARCH: '/dreams/search',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    TOP_SYMBOLS: '/analytics/top-symbols',
    TOP_EMOTIONS: '/analytics/top-emotions',
    PATTERNS: '/analytics/patterns',
    ACTIVITY: '/analytics/activity',
  },
  
  // Interpretation
  INTERPRETATION: {
    BASE: '/interpretation',
    BY_DREAM: (dreamId: number) => `/interpretation/dream/${dreamId}`,
    THEMES: '/interpretation/themes',
    PATTERNS: '/interpretation/patterns/personal',
    QUESTIONS: (dreamId: number) => `/interpretation/questions/${dreamId}`,
    SHADOW: (dreamId: number) => `/interpretation/shadow/${dreamId}`,
  },
  
  // Symbols and Emotions
  SYMBOLS: '/dreams/symbols',
  EMOTIONS: '/dreams/emotions',
} as const;

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
