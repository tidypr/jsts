import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserGoals, upsertGoal, deleteGoal } from '../actions/goals.actions';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const result = await getUserGoals();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useUpsertGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { type: 'DAILY' | 'WEEKLY' | 'MONTHLY'; targetMinutes: number }) => {
      const result = await upsertGoal(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['goals'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['goal-progress'],
        exact: false,
        refetchType: 'all'
      });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
      const result = await deleteGoal(type);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['goals'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['goal-progress'],
        exact: false,
        refetchType: 'all'
      });
    },
  });
}
