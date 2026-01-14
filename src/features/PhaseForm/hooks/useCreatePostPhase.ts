import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPostPhase, createPostPhaseWithTime } from '../actions/createPostPhase.action';

export function useCreatePostPhase(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { templateId: string; endTime: Date }) => {
      const result = await createPostPhase(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async () => {
      // 모든 dailyPhases 쿼리를 무효화하고 즉시 다시 가져오기
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all' // 모든 쿼리를 즉시 refetch
      });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases', userId] });
      await queryClient.invalidateQueries({ queryKey: ['activityHeatmap', userId] });
      await queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
    },
  });
}

export function useCreatePostPhaseWithTime(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      templateId: string;
      startTime: Date;
      endTime: Date;
    }) => {
      const result = await createPostPhaseWithTime(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async () => {
      // 모든 dailyPhases 쿼리를 무효화하고 즉시 다시 가져오기
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all' // 모든 쿼리를 즉시 refetch
      });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases', userId] });
      await queryClient.invalidateQueries({ queryKey: ['activityHeatmap', userId] });
      await queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
    },
  });
}
