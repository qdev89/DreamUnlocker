import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseDreamsService, firebaseSymbolsService } from '../services/firebase';
import type { DreamCreateData } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const useDreams = (limitCount?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dreams', user?.id, limitCount],
    queryFn: () => firebaseDreamsService.getUserDreams(user!.id, limitCount),
    enabled: !!user,
  });
};

export const useDream = (id: string) => {
  return useQuery({
    queryKey: ['dream', id],
    queryFn: () => firebaseDreamsService.getDreamById(id),
    enabled: !!id,
  });
};

export const useCreateDream = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dreamData: DreamCreateData) => firebaseDreamsService.createDream(user!.id, dreamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DreamCreateData> }) =>
      firebaseDreamsService.updateDream(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dream', id] });
    },
  });
};

export const useDeleteDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => firebaseDreamsService.deleteDream(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useSearchDreams = (query: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dreams', 'search', query, user?.id],
    queryFn: () => firebaseDreamsService.searchUserDreams(user!.id, query),
    enabled: query.length > 2 && !!user,
  });
};

export const useSymbols = () => {
  return useQuery({
    queryKey: ['symbols'],
    queryFn: () => firebaseSymbolsService.getAllSymbols(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Note: Emotions are now part of the symbols system in Firebase
// We'll create a separate hook for emotions if needed
export const useEmotions = () => {
  return useQuery({
    queryKey: ['emotions'],
    queryFn: () => firebaseSymbolsService.getSymbolsByCategory('emotion'),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
