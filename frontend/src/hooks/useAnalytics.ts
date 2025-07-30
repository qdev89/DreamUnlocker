import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.getDashboardStats(),
  });
};

export const useTopSymbols = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-symbols', limit],
    queryFn: () => analyticsService.getTopSymbols(limit),
  });
};

export const useTopEmotions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-emotions', limit],
    queryFn: () => analyticsService.getTopEmotions(limit),
  });
};

export const useSymbolCorrelations = () => {
  return useQuery({
    queryKey: ['symbol-correlations'],
    queryFn: () => analyticsService.getSymbolCorrelations(),
  });
};

export const useEmotionPatterns = () => {
  return useQuery({
    queryKey: ['emotion-patterns'],
    queryFn: () => analyticsService.getEmotionPatterns(),
  });
};

export const useActivityData = (days: number = 30) => {
  return useQuery({
    queryKey: ['activity-data', days],
    queryFn: () => analyticsService.getActivityData(days),
  });
};
