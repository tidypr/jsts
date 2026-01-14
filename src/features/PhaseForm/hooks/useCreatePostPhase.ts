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
    onSuccess: () => {
      // 모든 dailyPhases 쿼리를 무효화 (날짜 상관없이)
      queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false 
      });
      queryClient.invalidateQueries({ queryKey: ['recentPhases', userId] });
      queryClient.invalidateQueries({ queryKey: ['activityHeatmap', userId] });
      queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
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
    onSuccess: () => {
      // 모든 dailyPhases 쿼리를 무효화 (날짜 상관없이)
      queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false 
      });
      queryClient.invalidateQueries({ queryKey: ['recentPhases', userId] });
      queryClient.invalidateQueries({ queryKey: ['activityHeatmap', userId] });
      queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
    },
  });
}
