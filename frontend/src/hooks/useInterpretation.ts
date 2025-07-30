import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interpretationService } from '../services/interpretationService';
import { CreateInterpretationRequest } from '../types';

export const useCreateInterpretation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateInterpretationRequest) => 
      interpretationService.createInterpretation(request),
    onSuccess: (_, { dreamId }) => {
      queryClient.invalidateQueries({ queryKey: ['dream', dreamId] });
      queryClient.invalidateQueries({ queryKey: ['interpretation', dreamId] });
    },
  });
};

export const useInterpretation = (dreamId: number) => {
  return useQuery({
    queryKey: ['interpretation', dreamId],
    queryFn: () => interpretationService.getInterpretationByDream(dreamId),
    enabled: !!dreamId,
  });
};

export const useInterpretationThemes = () => {
  return useQuery({
    queryKey: ['interpretation-themes'],
    queryFn: () => interpretationService.getInterpretationThemes(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const usePersonalSymbolPatterns = () => {
  return useQuery({
    queryKey: ['personal-symbol-patterns'],
    queryFn: () => interpretationService.getPersonalSymbolPatterns(),
  });
};

export const useExploratoryQuestions = (dreamId: number) => {
  return useQuery({
    queryKey: ['exploratory-questions', dreamId],
    queryFn: () => interpretationService.getExploratoryQuestions(dreamId),
    enabled: !!dreamId,
  });
};

export const useShadowWork = (dreamId: number) => {
  return useQuery({
    queryKey: ['shadow-work', dreamId],
    queryFn: () => interpretationService.getShadowWork(dreamId),
    enabled: !!dreamId,
  });
};
