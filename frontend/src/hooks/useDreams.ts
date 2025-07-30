import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dreamService } from '../services/dreamService';
import { CreateDreamRequest } from '../types';

export const useDreams = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['dreams', page, pageSize],
    queryFn: () => dreamService.getDreams(page, pageSize),
  });
};

export const useDream = (id: number) => {
  return useQuery({
    queryKey: ['dream', id],
    queryFn: () => dreamService.getDreamById(id),
    enabled: !!id,
  });
};

export const useCreateDream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dreamData: CreateDreamRequest) => dreamService.createDream(dreamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateDream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateDreamRequest> }) => 
      dreamService.updateDream(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dream', id] });
    },
  });
};

export const useDeleteDream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => dreamService.deleteDream(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useSearchDreams = (query: string) => {
  return useQuery({
    queryKey: ['dreams', 'search', query],
    queryFn: () => dreamService.searchDreams(query),
    enabled: query.length > 2,
  });
};

export const useSymbols = () => {
  return useQuery({
    queryKey: ['symbols'],
    queryFn: () => dreamService.getSymbols(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useEmotions = () => {
  return useQuery({
    queryKey: ['emotions'],
    queryFn: () => dreamService.getEmotions(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
