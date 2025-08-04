import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseInterpretationsService } from '../services/firebase';
import type { DreamInterpretationCreateData } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useCreateInterpretation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dreamId, ...data }: { dreamId: string } & DreamInterpretationCreateData) =>
      firebaseInterpretationsService.createInterpretation(dreamId, data),
    onSuccess: (_, { dreamId }) => {
      queryClient.invalidateQueries({ queryKey: ['dream', dreamId] });
      queryClient.invalidateQueries({ queryKey: ['interpretation', dreamId] });
    },
  });
};

export const useInterpretation = (dreamId: string) => {
  return useQuery({
    queryKey: ['interpretation', dreamId],
    queryFn: () => firebaseInterpretationsService.getInterpretationByDreamId(dreamId),
    enabled: !!dreamId,
  });
};

export const useInterpretationThemes = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['interpretation-themes', user?.id],
    queryFn: () => firebaseInterpretationsService.getUserInterpretations(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const usePersonalSymbolPatterns = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-symbol-patterns', user?.id],
    queryFn: () => firebaseInterpretationsService.getUserInterpretations(user!.id),
    enabled: !!user,
  });
};

export const useExploratoryQuestions = (dreamId: string) => {
  return useQuery({
    queryKey: ['exploratory-questions', dreamId],
    queryFn: async () => {
      const interpretation = await firebaseInterpretationsService.getInterpretationByDreamId(dreamId);
      return interpretation?.exploratoryQuestions || [];
    },
    enabled: !!dreamId,
  });
};

export const useShadowWork = (dreamId: string) => {
  return useQuery({
    queryKey: ['shadow-work', dreamId],
    queryFn: async () => {
      const interpretation = await firebaseInterpretationsService.getInterpretationByDreamId(dreamId);
      return interpretation?.shadowWork || null;
    },
    enabled: !!dreamId,
  });
};
