import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePhaseAction } from '../actions/deletePhase.action';

type DeletePhaseInput = {
  phaseId: string;
};

export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeletePhaseInput) => {
      const result = await deletePhaseAction(data);
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
    },
  });
}
