import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completePhaseAction } from '../actions/completePhase.action';

type CompletePhaseInput = {
  phaseId: string;
  note?: string;
};

export function useCompletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompletePhaseInput) => {
      const result = await completePhaseAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async () => {
      // 관련 쿼리 무효화
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases'] });
      await queryClient.invalidateQueries({ queryKey: ['activityHeatmap'] });
      await queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
    },
  });
}
