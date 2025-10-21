import { useQuery } from '@tanstack/react-query';
import { firebaseAnalyticsService, firebaseDreamsService } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const dreams = await firebaseDreamsService.getUserDreams(user.id);
      const analytics = await firebaseAnalyticsService.getUserAnalyticsSummary(user.id);

      return {
        totalDreams: dreams.length,
        totalSymbols: analytics.totalSymbols,
        mostFrequentSymbol: analytics.mostFrequentSymbol,
        recentDreams: dreams.slice(0, 5)
      };
    },
    enabled: !!user,
  });
};

export const useTopSymbols = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['top-symbols', limit, user?.id],
    queryFn: async () => {
      const frequencies = await firebaseAnalyticsService.getUserSymbolFrequencies(user!.id);
      return frequencies.slice(0, limit);
    },
    enabled: !!user,
  });
};

export const useTopEmotions = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['top-emotions', limit, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all user dreams and extract emotions
      const dreams = await firebaseDreamsService.getUserDreams(user.id);
      const emotionCounts = new Map<string, number>();

      dreams.forEach(dream => {
        dream.emotions.forEach(emotion => {
          emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
        });
      });

      // Convert to array and sort by frequency
      return Array.from(emotionCounts.entries())
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
    enabled: !!user,
  });
};

export const useSymbolCorrelations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['symbol-correlations', user?.id],
    queryFn: () => firebaseAnalyticsService.getUserAnalyticsSummary(user!.id),
    enabled: !!user,
  });
};

export const useEmotionPatterns = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['emotion-patterns', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all user dreams and analyze emotion patterns over time
      const dreams = await firebaseDreamsService.getUserDreams(user.id);

      // Group emotions by date to see patterns
      const emotionsByDate = dreams.map(dream => ({
        date: dream.dreamDate,
        emotions: dream.emotions
      }));

      return emotionsByDate;
    },
    enabled: !!user,
  });
};

export const useActivityData = (days: number = 30) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-data', days, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const dreams = await firebaseDreamsService.getUserDreams(user.id);
      // Simple activity data - count dreams per day for the last 'days' period
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      return dreams
        .filter(dream => dream.dreamDate >= startDate)
        .map(dream => ({
          date: dream.dreamDate.toISOString().split('T')[0],
          count: 1
        }));
    },
    enabled: !!user,
  });
};
